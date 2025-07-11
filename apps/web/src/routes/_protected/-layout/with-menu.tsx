import { Logo } from '#/assets';
import { getRouteChildren } from '#/routeTools';
import { Button, cn, Label, useCallbackRef } from '@packages/ui';
import { AnyRoute, Link, useRouter } from '@tanstack/react-router';
import { get } from 'lodash-es';
import { Menu } from 'lucide-react';
import { RefObject, useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';


export const withMenu = <T extends object>(Component: React.ComponentType<T>) => {
  function LoginButton() {
    const { signoutRedirect, signinRedirect, user, isAuthenticated } = useAuth();

    return !isAuthenticated
      ? (
        <Button
          onClick={() => signinRedirect()}
        >
          로그인
        </Button>
      )
      : (
        <div className="tw:flex tw:flex-row tw:items-center tw:gap-2">
          <div>
            <span className="tw:font-bold">{`${user?.profile.nickname} 님, `}</span>
            <span>안녕하세요.</span>
          </div>
          <Button
            onClick={() => signoutRedirect({ state: user })}
          >
            로그아웃
          </Button>
        </div>
      );
  }

  function MenuButton({ ref }: { ref: RefObject<HTMLInputElement | null> }) {
    const [inputRef, setRef] = useCallbackRef(ref);

    const handleResize = () => {
      if (!inputRef.current) return;
      if (window.innerWidth >= 768) {
        inputRef.current.checked = true;
      }
      else {
        inputRef.current.checked = false;
      }
    };

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    return (
      <Button asChild className="tw:md:hidden">
        <Label>
          <input ref={setRef} type="checkbox" hidden />
          <Menu />
        </Label>
      </Button>
    );
  }

  function Wrapper(props: T) {
    const { routeTree } = useRouter();
    const menuRef = useRef<HTMLInputElement>(null);

    const getOrder = (route: AnyRoute) => get(route, 'options.staticData.order', 0);
    const menuItems = getRouteChildren(routeTree, '/_protected/_page')
      .filter((i) => i.options.staticData?.order)
      .toSorted((a, b) => getOrder(a) - getOrder(b));

    return (
      <div id="wrapper" className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
        <header className={cn(
          'tw:relative', 'tw:group',
          'tw:flex tw:justify-between tw:items-center',
        )}
        >
          <div role="banner">
            <Link to="/home">
              <img src={Logo} className="tw:h-10" />
            </Link>
          </div>
          <div
            role="navigation"
            className={cn(
              'tw:group-has-[input:not(:checked)]:hidden',
              'tw:flex tw:items-center tw:inset-0',
              'tw:m-0 tw:z-50 tw:w-full tw:h-full tw:fixed tw:top-10 tw:flex-col tw:justify-start',
              'tw:md:m-auto tw:md:z-0 tw:md:w-fit tw:md:h-full tw:md:absolute tw:md:top-0 tw:md:flex-row tw:md:justify-center',
            )}
            onClick={() => {
              if (menuRef.current && window.innerWidth <= 768) menuRef.current.checked = false;
            }}
          >
            <div className={cn(
              'tw:absolute tw:size-full',
              'tw:bg-black tw:opacity-40 tw:-z-10',
              'tw:md:hidden',
            )}
            />
            {menuItems.map((v) => (
              <Link
                key={v.id}
                to={v.fullPath}
                className={cn(
                  'tw:text-center tw:border-b-2',
                  'tw:w-full tw:mx-0 tw:p-2 tw:bg-background',
                  'tw:md:w-fit tw:md:mx-2 tw:md:p-0',
                )}
                activeProps={{
                  className: 'tw:font-extrabold',
                }}
              >
                {v.options.staticData?.title}
              </Link>
            ),
            )}
          </div>
          <div role="toolbar" className="tw:flex tw:items-center tw:gap-1">
            <LoginButton />
            <MenuButton ref={menuRef} />
          </div>
        </header>
        <main>
          <Component {...props} />
        </main>
      </div>

    );
  }
  return Wrapper;
};

