export type Landmark = { x: number; y: number; z?: number };

export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  // Angle at point b formed by points a-b-c in 2D using x,y
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);
  if (magAB === 0 || magCB === 0) return 0;
  const cosTheta = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  const angleRad = Math.acos(cosTheta);
  return (angleRad * 180) / Math.PI;
}



