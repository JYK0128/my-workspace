import { sample } from '#utils/sample.ts';

export function Sample() {
  return (
    <div>
      <SampleFunction />
      <SampleTypeComp where="types.d.ts" />
      <SampleVIteTypeComp where="vite-env.d.ts" />
    </div>
  );
}

function SampleFunction() {
  return <div>{sample()}</div>;
}

export function SampleVIteTypeComp({ where }: SampleViteType) {
  return <div>{where}</div>;
}

export function SampleTypeComp({ where }: SampleType) {
  return <div>{where}</div>;
}
