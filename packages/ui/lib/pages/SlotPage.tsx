import { SidebarLayout } from '#customs/components/SidebarLayout.tsx';
import { useTemplate } from '#customs/hooks/use-template.tsx';

export function SlotPage() {
  const { Slot, Template } = useTemplate(['title', 'hello', 'world']);

  return (
    <SidebarLayout>
      <Template>
        <Slot name="title">
          <div>슬롯 테스트01</div>
        </Slot>
        <Slot name="hello">
          <div>슬롯 테스트02</div>
        </Slot>
        <Slot name="world" asChild>
          <div>슬롯 테스트03(asChild)</div>
        </Slot>
      </Template>
    </SidebarLayout>
  );
}
