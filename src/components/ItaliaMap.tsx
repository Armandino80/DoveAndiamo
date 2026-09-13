import { Link } from "@tanstack/react-router";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useRef,
  useState,
} from "react";
import { cities } from "@/data/cities";
import type { Progress } from "@/lib/progress";
import { getCityProgress } from "@/lib/progress";

// Simplified Italy outline (mainland, Sicily, Sardinia) in a 600×680 viewBox,
// projected with an equirectangular projection around 41.5°N.
const ITALY_PATHS = [
  "M188.7,33.5 L216.5,42.2 L221.8,30.5 L266.8,20.0 L277.0,41.2 L342.5,57.0 L342.5,57.0 L337.4,87.0 L348.4,112.9 L348.4,112.9 L312.0,104.0 L274.9,125.7 L277.3,155.9 L271.8,173.3 L286.7,204.4 L329.6,235.1 L352.7,285.5 L403.5,334.6 L439.2,334.3 L450.3,347.7 L437.5,359.9 L478.5,382.0 L512.0,400.4 L551.1,432.2 L555.9,443.6 L547.4,465.4 L522.0,436.9 L482.2,426.9 L463.2,466.3 L496.1,489.0 L490.6,520.9 L471.6,524.5 L447.2,576.7 L428.1,581.4 L428.3,562.8 L437.7,530.0 L447.5,517.0 L429.8,481.7 L415.8,451.0 L396.9,443.3 L383.4,417.0 L354.0,406.0 L334.2,381.4 L300.4,377.5 L264.7,349.9 L222.9,310.3 L191.8,275.2 L177.7,214.8 L155.0,207.8 L117.8,187.6 L96.8,195.9 L70.3,224.2 L51.4,228.6 L51.4,228.6 L56.7,202.2 L31.8,194.5 L20.0,147.3 L36.0,128.7 L22.5,105.8 L24.3,88.5 L24.3,88.5 L44.0,101.5 L66.0,98.7 L91.7,78.0 L99.6,87.7 L121.3,85.8 L131.2,61.1 L165.0,68.8 L185.1,58.5 L188.7,33.5Z",
  "M386.0,567.1 L420.7,561.8 L404.3,609.8 L411.0,628.7 L401.5,660.0 L366.5,637.1 L343.3,630.5 L279.7,599.5 L285.9,568.1 L339.3,573.7 L386.0,567.1Z",
  "M109.6,399.0 L132.5,380.2 L159.8,423.4 L153.4,504.1 L132.6,500.2 L114.1,520.5 L96.8,504.4 L95.0,430.8 L84.5,395.9 L109.6,399.0Z",
];

const COS = Math.cos((41.5 * Math.PI) / 180);
const MIN_LNG_COS = 6.748267482674834 * COS;
const MAX_LNG_COS = 18.480784807848096 * COS;
const MIN_LAT = 36.62077432362676;
const MAX_LAT = 47.114637664285226;
const W = 600;
const H = 680;
const PAD = 20;
const SCALE = Math.min(
  (W - 2 * PAD) / (MAX_LNG_COS - MIN_LNG_COS),
  (H - 2 * PAD) / (MAX_LAT - MIN_LAT),
);
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.35;

interface MapView {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

const INITIAL_VIEW: MapView = { x: 0, y: 0, width: W, height: H };

function clampView(view: MapView): MapView {
  const minWidth = W / MAX_ZOOM;
  const width = Math.min(W, Math.max(minWidth, view.width));
  const height = width * (H / W);

  return {
    x: Math.min(W - width, Math.max(0, view.x)),
    y: Math.min(H - height, Math.max(0, view.y)),
    width,
    height,
  };
}

function getDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getCenter(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Project WGS84 coordinates into the map's 600×680 viewBox. */
export function projectToMap(lat: number, lng: number): { x: number; y: number } {
  const x = PAD + (lng * COS - MIN_LNG_COS) * SCALE;
  const y = H - (PAD + (lat - MIN_LAT) * SCALE);
  return { x, y };
}

interface ItaliaMapProps {
  progress: Progress;
}

type Gesture =
  | {
      mode: "pan";
      pointerId: number;
      startPoint: Point;
      startView: MapView;
    }
  | {
      mode: "pinch";
      startDistance: number;
      anchor: Point;
      startView: MapView;
    };

export function ItaliaMap({ progress }: ItaliaMapProps) {
  const [view, setView] = useState<MapView>(INITIAL_VIEW);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef<Gesture | null>(null);
  const didDragRef = useRef(false);

  const zoomLevel = W / view.width;
  const markerScale = 1 / zoomLevel;
  const canZoomIn = zoomLevel < MAX_ZOOM - 0.01;
  const canZoomOut = zoomLevel > 1.01;

  const clientToMap = (point: Point, sourceView: MapView = view): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect)
      return { x: sourceView.x + sourceView.width / 2, y: sourceView.y + sourceView.height / 2 };

    return {
      x: sourceView.x + ((point.x - rect.left) / rect.width) * sourceView.width,
      y: sourceView.y + ((point.y - rect.top) / rect.height) * sourceView.height,
    };
  };

  const zoomAt = (anchor: Point, factor: number) => {
    setView((current) => {
      const nextWidth = current.width / factor;
      const nextHeight = current.height / factor;
      const ratioX = (anchor.x - current.x) / current.width;
      const ratioY = (anchor.y - current.y) / current.height;

      return clampView({
        x: anchor.x - ratioX * nextWidth,
        y: anchor.y - ratioY * nextHeight,
        width: nextWidth,
        height: nextHeight,
      });
    });
  };

  const zoomFromCenter = (factor: number) => {
    zoomAt({ x: view.x + view.width / 2, y: view.y + view.height / 2 }, factor);
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const anchor = clientToMap({ x: event.clientX, y: event.clientY });
    zoomAt(anchor, event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP);
  };

  const startPinch = () => {
    const points = [...pointersRef.current.values()];
    if (points.length < 2) return;

    const [a, b] = points;
    const center = getCenter(a, b);
    gestureRef.current = {
      mode: "pinch",
      startDistance: Math.max(1, getDistance(a, b)),
      anchor: clientToMap(center),
      startView: view,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const point = { x: event.clientX, y: event.clientY };
    didDragRef.current = false;
    pointersRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (pointersRef.current.size >= 2) {
      startPinch();
      return;
    }

    gestureRef.current = {
      mode: "pan",
      pointerId: event.pointerId,
      startPoint: point,
      startView: view,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    const gesture = gestureRef.current;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!gesture || !rect) return;

    if (gesture.mode === "pinch") {
      const points = [...pointersRef.current.values()];
      if (points.length < 2) return;

      const [a, b] = points;
      const center = getCenter(a, b);
      const scale = getDistance(a, b) / gesture.startDistance;
      const width = gesture.startView.width / Math.max(0.2, scale);
      const height = width * (H / W);
      const centerRatioX = (center.x - rect.left) / rect.width;
      const centerRatioY = (center.y - rect.top) / rect.height;

      didDragRef.current = true;
      setView(
        clampView({
          x: gesture.anchor.x - centerRatioX * width,
          y: gesture.anchor.y - centerRatioY * height,
          width,
          height,
        }),
      );
      return;
    }

    if (gesture.pointerId !== event.pointerId) return;

    const dx = point.x - gesture.startPoint.x;
    const dy = point.y - gesture.startPoint.y;
    if (Math.hypot(dx, dy) > 4) didDragRef.current = true;

    setView(
      clampView({
        ...gesture.startView,
        x: gesture.startView.x - (dx / rect.width) * gesture.startView.width,
        y: gesture.startView.y - (dy / rect.height) * gesture.startView.height,
      }),
    );
  };

  const handlePointerEnd = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(event.pointerId);

    const remaining = [...pointersRef.current.entries()];
    if (remaining.length === 1) {
      const [pointerId, point] = remaining[0];
      gestureRef.current = {
        mode: "pan",
        pointerId,
        startPoint: point,
        startView: view,
      };
    } else if (remaining.length === 0) {
      gestureRef.current = null;
    }
  };

  const handleClickCapture = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!didDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    didDragRef.current = false;
  };

  return (
    <div className="rounded-3xl bg-card p-4 shadow-sm md:p-6">
      <div className="mb-3">
        <p className="font-display text-xl font-semibold italic">La tua mappa</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Tik op een stad om haar te openen. Ontdekte steden krijgen een naam; zoom of sleep om
          makkelijk te navigeren.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-muted/20">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
          role="img"
          aria-label="Interactieve kaart van Italië met klikbare steden"
          className="block h-auto w-full cursor-grab select-none active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClickCapture={handleClickCapture}
        >
          <desc>
            Zoom met twee vingers, het muiswiel of de knoppen. Sleep om de kaart te verplaatsen.
            Alle steden zijn gemarkeerd en klikbaar; ontdekte steden tonen ook hun naam.
          </desc>
          {ITALY_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              className="pointer-events-none fill-muted stroke-background"
              strokeWidth={2 * markerScale}
              strokeLinejoin="round"
            />
          ))}

          {cities.map((city) => {
            const discovered = getCityProgress(progress, city.id).visits > 0;
            const { x, y } = projectToMap(city.coordinates.lat, city.coordinates.lng);
            const markerTransform = `translate(${x} ${y}) scale(${markerScale}) translate(${-x} ${-y})`;

            return (
              <Link
                key={city.id}
                to="/citta/$id"
                params={{ id: city.id }}
                aria-label={`Bekijk ${city.name}${discovered ? "" : " — nog te ontdekken"}`}
              >
                <g className="group cursor-pointer" transform={markerTransform}>
                  <circle cx={x} cy={y - 6} r={34} fill="transparent" />
                  {discovered ? (
                    <>
                      <circle cx={x} cy={y} r={22} className="animate-pulse fill-primary/20" />
                      <circle
                        cx={x}
                        cy={y}
                        r={11}
                        className="fill-primary stroke-primary-foreground transition-transform group-hover:scale-125"
                        strokeWidth={3}
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      />
                      <text
                        x={x}
                        y={y - 20}
                        textAnchor="middle"
                        className="fill-foreground font-display text-lg font-semibold italic"
                      >
                        {city.name}
                      </text>
                    </>
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r={7}
                      className="fill-muted-foreground/25 stroke-background transition-all group-hover:fill-primary/45"
                      strokeWidth={3}
                    />
                  )}
                </g>
              </Link>
            );
          })}
        </svg>

        <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-xl border border-border/60 bg-card/95 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => zoomFromCenter(ZOOM_STEP)}
            disabled={!canZoomIn}
            aria-label="Inzoomen"
            title="Inzoomen"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => zoomFromCenter(1 / ZOOM_STEP)}
            disabled={!canZoomOut}
            aria-label="Uitzoomen"
            title="Uitzoomen"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setView(INITIAL_VIEW)}
            disabled={!canZoomOut}
            aria-label="Kaart herstellen"
            title="Kaart herstellen"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card/90 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
          Tik op een stad · knijp of scroll om te zoomen · sleep om te bewegen
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" />
          Ontdekt
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-muted-foreground/25" />
          Nog te ontdekken
        </span>
      </div>
    </div>
  );
}
