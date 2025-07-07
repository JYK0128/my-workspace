import { FileRoutesById } from '#/routeTree.gen';
import { AnyRoute, createRoute } from '@tanstack/react-router';
import { trimStart } from 'lodash-es';
import { lazy } from 'react';
import { z } from 'zod';
import { Route as ProtectedImport } from './routes/_protected';
import { Route as PublicImport } from './routes/_public';


/* 라우팅 관련 유틸 */
type RouteLike = keyof FileRoutesById | `${keyof FileRoutesById}/${string}`;

const Data = z.object({
  path: z.string(),
  template: z.string(),
  is_public: z.boolean(),
  metadata: z.object({
    title: z.string().optional(),
    order: z.number().optional(),
  }).optional(),
});
type Data = z.infer<typeof Data>;


export function getRoute(
  node: AnyRoute,
  id: RouteLike,
): AnyRoute | undefined {
  console.log('node: ', node.id);
  if (node.id === id) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      console.log('child: ', child.id);
      const found = getRoute(child, id);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export function getRouteChildren(
  node: AnyRoute,
  parentId: RouteLike,
): AnyRoute[] {
  let routes: AnyRoute[] = [];
  if (String(node.id).match(`^${parentId}/[^/]+/?$`)) {
    routes.push(node);
  }

  if (node.children) {
    const children = Array.isArray(node.children)
      ? node.children
      : [node.children];

    for (const child of children) {
      routes = routes.concat(getRouteChildren(child, parentId));
    }
  }

  return routes;
}

export function appendRoute(
  tree: AnyRoute,
  route: AnyRoute[],
) {
  const children = Array.isArray(tree.children)
    ? tree.children
    : [tree.children];

  if (children.every((v) => !v.id)) {
    tree.addChildren([
      ...children,
      ...route,
    ]);
  }
}

const publicModules = import.meta.glob('./routes/_public/-template/**/*.tsx');
const protectedModules = import.meta.glob('./routes/_protected/-template/**/*.tsx');
export function createRouteByData(data: Data) {
  const safeData = Data.parse(data);

  const { is_public } = safeData;
  let { path, template, metadata } = safeData;
  path = trimStart(path, '/');
  template = trimStart(template, './');
  template = trimStart(template, '/');
  template = template.split('.')[0];
  metadata = metadata ?? {};

  return createRoute({
    path: path,
    component: is_public
      ? lazy(publicModules[`./routes/_public/-template/${template}.tsx`] as unknown as Parameters<typeof lazy>[0])
      : lazy(protectedModules[`./routes/_protected/-template/${template}.tsx`] as unknown as Parameters<typeof lazy>[0]),
    staticData: { ...metadata },
    getParentRoute: () => is_public ? PublicImport : ProtectedImport,
  })
    .update({
      id: `/_page/${path}`,
    } as never);
}
