import { SidebarLayout, TreeNode, TreeView } from '#customs/components/index.ts';

const initialData: TreeNode[] = [
  {
    id: '1',
    label: 'Parent 1',
    children: [
      {
        id: '1-1',
        label: 'Child 1-1',
        children: [{
          id: '1-1-1',
          label: 'Child 1-1-1',
        }],
      },
      {
        id: '1-2',
        label: 'Child 1-2',
        children: [{
          id: '1-2-1',
          label: 'Child 1-2-1',
        }],
      },
      {
        id: '1-3',
        label: 'Child 1-3',
        children: [{
          id: '1-3-1',
          label: 'Child 1-3-1',
        }],
      },
      { id: '1-4', label: 'Child 1-4' },
    ],
  },
  {
    id: '2',
    label: 'Parent 2',
    readonly: true,
    children: [
      { id: '2-1', label: 'Child 2-1' },
    ],
  },
];

export function TreePage() {
  return (
    <SidebarLayout>
      <TreeView defaultValue={initialData} />
    </SidebarLayout>
  );
}
