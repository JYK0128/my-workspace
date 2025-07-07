import { ProgressCircle } from '#customs/components/index.ts';


export function TestPage() {
  return (
    <div className="tw:size-full">
      <ProgressCircle pct={50} size="70px" showPct />
    </div>
  );
}
