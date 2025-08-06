import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from '@packages/ui';
import { createFileRoute } from '@tanstack/react-router';
import { uniqueId } from 'lodash-es';
import { useEffect, useState } from 'react';

import { withMenu } from '#/routes/_protected/-layout/with-menu';

export const Route = createFileRoute('/_protected/_page/code-editor')({
  component: withMenu(RouteComponent),
  staticData: {
    order: 1,
    title: '코드에디터',
  },
});

function RouteComponent() {
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      @import "tailwindcss" prefix(tw);
      html, body, #root {
        width: 100%;
        height: 100%;
        margin: 0;
      }
      * {
        overflow: hidden;
        min-width: 0;
        min-height: 0;
        max-width: 100%;
        max-height: 100%;
      }
    </style>
    <script defer>
      const oldLog = console.log;
      console.log = function (...args) {
        parent.postMessage({ type: 'log', data: args }, '*');
      };
    </script>
  </head>
  <body>
    Hello World!
    <script>
    </script>
  </body>
</html>`);

  const [output, setOutput] = useState<string[]>([]);
  const [srcDoc, setSrcDoc] = useState<string>(code);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        const currentCode = editor.getValue();
        setSrcDoc(currentCode);
      },
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'log') {
        setOutput((prv) => [...prv, event.data.data.join(' ')]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="tw:size-full tw:grid tw:grid-cols-2">
      <Editor
        width="100%"
        value={code}
        language="html"
        onChange={(value) => setCode(value ?? '')}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          wordWrap: 'on',
        }}
      />
      <div className="tw:flex tw:flex-col">
        <iframe
          srcDoc={srcDoc}
          title="Live Preview"
          sandbox="allow-scripts"
          width="100%"
          height="100%"
        />
        <div className="tw:h-50 tw:scroll-y tw:border-t-2 tw:pt-1">
          <div className="tw:sticky tw:inset-0 tw:bg-background tw:flex tw:justify-between">
            <div>콘솔창</div>
            <Button onClick={() => setOutput([])} variant="outline">
              reset
            </Button>
          </div>
          {output.map((v) => <div key={uniqueId()}>{v}</div>)}
        </div>
      </div>
    </div>
  );
}
