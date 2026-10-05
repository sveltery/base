// Complete immutable Original render expressions; pin47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
import * as React from 'react';
import {NavigationMenu} from '@base-ui/react/navigation-menu';
export function NavigationMenuPartsOriginal({scenario}:{scenario:string}) {
 const [showFirst,setShowFirst]=React.useState(true);
 const navigate=React.useRef(()=>{});
 const keyCalls=React.useRef<string[]>([]);
 const handleKeyDown=(event:React.KeyboardEvent)=>{keyCalls.current.push(event.key);};
 React.useEffect(()=>{Object.assign(window,{navigationMenuParts:{snapshot:()=>({keys:[...keyCalls.current]}),removeFirst:()=>setShowFirst(false),navigate:()=>navigate.current()}});return()=>{delete (window as unknown as {navigationMenuParts?:unknown}).navigationMenuParts;};},[]);
 switch(scenario){
 case 'list-removal': return <ListRemoval showFirst={showFirst} />;
 case 'trigger-enable': return <TriggerEnable />;
 case 'drop-trigger': return <TestActiveItemDropsTrigger registerNavigate={fn=>{navigate.current=fn;}} />;
 case 'content-kept': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
              <NavigationMenu.Content keepMounted data-testid="content-1">
                <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 case 'content-unkept': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="content-1">
                <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 case 'content-move': return (
<NavigationMenu.Root>
        <NavigationMenu.List data-testid="list">
          <NavigationMenu.Item value="item-1">
            <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
            <NavigationMenu.Content keepMounted data-testid="content-1">
              <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="item-2">
            <NavigationMenu.Trigger>Item 2</NavigationMenu.Trigger>
            <NavigationMenu.Content keepMounted data-testid="content-2">
              <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Portal>
          <NavigationMenu.Positioner>
            <NavigationMenu.Popup>
              <NavigationMenu.Viewport data-testid="viewport" />
            </NavigationMenu.Popup>
          </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
      </NavigationMenu.Root>
);
 case 'content-close': return (
<NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="item-1">
            <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
            <NavigationMenu.Content keepMounted data-testid="content-1">
              <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Portal keepMounted>
          <NavigationMenu.Positioner>
            <NavigationMenu.Popup>
              <NavigationMenu.Viewport data-testid="viewport" />
            </NavigationMenu.Popup>
          </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
      </NavigationMenu.Root>
);
 case 'link-close': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item value="item-1">
              <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="popup-1">
                <NavigationMenu.Link href="#link-1" closeOnClick>
                  Link 1
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 case 'link-keep': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item value="item-1">
              <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="popup-1">
                <NavigationMenu.Link href="#link-1" closeOnClick={false}>
                  Link 1
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 case 'link-active': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="#" active>
                active
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
);
 case 'link-inactive': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="#" active={false}>
                inactive
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
);
 case 'link-blur': return (
<NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item value="item-1">
            <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        <NavigationMenu.Portal>
          <NavigationMenu.Positioner>
            <NavigationMenu.Popup>
              <NavigationMenu.Viewport />
            </NavigationMenu.Popup>
          </NavigationMenu.Positioner>
        </NavigationMenu.Portal>
      </NavigationMenu.Root>
);
 case 'list-keys': return (
<div onKeyDown={handleKeyDown}>
        <NavigationMenu.Root orientation="vertical">
          <NavigationMenu.List data-testid="list">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Item</NavigationMenu.Trigger>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
);
 case 'custom-list': return (
<NavigationMenu.Root>
          <NavigationMenu.List render={<div data-testid="custom-list" />}>
            <NavigationMenu.Item value="item">
              <NavigationMenu.Trigger>Trigger 1</NavigationMenu.Trigger>
              <NavigationMenu.Content>Content 1</NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="item-2">
              <NavigationMenu.Trigger>Trigger 2</NavigationMenu.Trigger>
              <NavigationMenu.Content>Content 2</NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 case 'arbitrary': return (
<div>
          <NavigationMenu.Root>
            <NavigationMenu.List>
              <NavigationMenu.Item value="item">
                <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <button>Action</button>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>
            <NavigationMenu.Portal>
              <NavigationMenu.Positioner>
                <NavigationMenu.Popup data-testid="popup">
                  <NavigationMenu.Viewport />
                </NavigationMenu.Popup>
              </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
          </NavigationMenu.Root>
          <button>After menu</button>
        </div>
);
 case 'no-viewport': return (
<NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item value="item">
              <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
              <NavigationMenu.Content>Content</NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>Popup</NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 case 'icons': return (
<NavigationMenu.Root defaultValue="item-1">
            <NavigationMenu.List>
              <NavigationMenu.Item value="item-1">
                <NavigationMenu.Trigger>
                  Item 1
                  <NavigationMenu.Icon data-testid="icon-1" />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
              <NavigationMenu.Item value="item-2">
                <NavigationMenu.Trigger>
                  Item 2
                  <NavigationMenu.Icon data-testid="icon-2" />
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Portal>
              <NavigationMenu.Positioner>
                <NavigationMenu.Popup>
                  <NavigationMenu.Viewport />
                </NavigationMenu.Popup>
              </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
          </NavigationMenu.Root>
);
 case 'sweep': return (
<NavigationMenu.Root>
          <NavigationMenu.List data-testid="list">
            <NavigationMenu.Item value="a">
              <NavigationMenu.Trigger>A</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="#a">A link</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="b">
              <NavigationMenu.Trigger>B</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="#b">B link</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Portal keepMounted>
            <NavigationMenu.Positioner>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
);
 default: throw new Error('Unknown Source part fixture '+scenario);
 }
}

function ListRemoval({showFirst}:{showFirst:boolean}) {
function App({ showFirst }: { showFirst: boolean }) {
      return (
        <NavigationMenu.Root>
          <NavigationMenu.List>
            {showFirst && (
              <NavigationMenu.Item>
                <NavigationMenu.Trigger data-testid="first">One</NavigationMenu.Trigger>
              </NavigationMenu.Item>
            )}
            <NavigationMenu.Item>
              <NavigationMenu.Trigger data-testid="middle">Two</NavigationMenu.Trigger>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Trigger data-testid="last">Three</NavigationMenu.Trigger>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      );
    }
return <App showFirst={showFirst}/>;
}

function TriggerEnable() {
function App() {
      const [disabled, setDisabled] = React.useState(true);
      return (
        <div>
          <NavigationMenu.Root>
            <NavigationMenu.List>
              <NavigationMenu.Item>
                <NavigationMenu.Trigger disabled={disabled} data-testid="trigger">
                  Overview
                </NavigationMenu.Trigger>
              </NavigationMenu.Item>
            </NavigationMenu.List>
          </NavigationMenu.Root>
          <button type="button" onClick={() => setDisabled(false)}>
            enable
          </button>
        </div>
      );
    }
return <App/>;
}

function TestActiveItemDropsTrigger({
  registerNavigate,
}: {
  registerNavigate: (navigate: () => void) => void;
}) {
  const [value, setValue] = React.useState<string | null>(null);
  const [aIsActive, setAIsActive] = React.useState(false);

  React.useEffect(() => {
    registerNavigate(() => {
      // Batched: close the menu and drop A's trigger (A becomes the active item rendered inline).
      setValue(null);
      setAIsActive(true);
    });
  }, [registerNavigate]);

  return (
    <NavigationMenu.Root value={value} onValueChange={setValue}>
      <NavigationMenu.List data-testid="list">
        {aIsActive ? (
          <NavigationMenu.Item value="a">
            <a href="#a">A active</a>
          </NavigationMenu.Item>
        ) : (
          <NavigationMenu.Item value="a">
            <NavigationMenu.Trigger>A</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="#a">A link</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        )}
        <NavigationMenu.Item value="b">
          <NavigationMenu.Trigger>B</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#b">B link</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
