import React from 'react';
import { useCookies } from 'react-cookie';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MappyBoi from './components/DetectiveMap/MappyBoi';
import FirstRunModal, {
  Props as FirstRunModalProps,
} from './components/FirstRunModal';
import Grid from './components/Grid';
import Content from './components/layout/Content';
import Sidebar from './components/layout/Sidebar';
import List from './components/List';
import universe from './data/universe';
import { AllMapLayers, MapLayer } from './util/map-layer';

type Props = {
  className?: React.HTMLAttributes<HTMLElement>['className'];
};

enum SidebarState {
  DEFAULT,
  OPEN,
  CLOSED,
}

const DefaultVisibleLayers: MapLayer[] = [
  MapLayer.SUNKEN_MODULE,
  MapLayer.VESSEL,
  MapLayer.QUANTUM_MOON,
  MapLayer.TIME_LOOP,
  MapLayer.INVISIBLE_PLANET,
  MapLayer.OTHER,
];

const DefaultShowLogCounts = false;
const DefaultSpoilerFreeMode = true;

const SpoilerFreeModeCookieName = 'spoiler-free-mode';
const VisibleLayersCookieName = 'visible-layers';

const cookie2boolean = (s: unknown, defaultValue: boolean): boolean => {
  if (s === 'true' || s === true) {
    return true;
  }

  if (s === 'false' || s === false) {
    return false;
  }

  return defaultValue;
};

const boolean2string = (b: boolean): 'true' | 'false' => {
  return b ? 'true' : 'false';
};

const cookie2VisibleLayers = (
  cookieValue: unknown,
  defaultValue: MapLayer[]
): MapLayer[] => {
  if (typeof cookieValue === 'string') {
    const array = cookieValue.split(',').map((v) => parseInt(v, 10));
    const filtered = array.filter((ml) =>
      AllMapLayers.includes(ml)
    ) as unknown as MapLayer[];
    return filtered;
  }

  return defaultValue;
};

const visibleLayers2string = (visibleLayers: MapLayer[]): string => {
  return visibleLayers.join(',');
};

const App: React.FC<Props> = ({ className }) => {
  const [cookies, setCookie] = useCookies([
    SpoilerFreeModeCookieName,
    VisibleLayersCookieName,
  ]);

  const [sidebarState, setSidebarState] = React.useState<SidebarState>(
    SidebarState.DEFAULT
  );

  const [showLogCounts, setShowLogCounts] = React.useState<boolean>(
    DefaultShowLogCounts
  );

  const [spoilerFreeMode, setSpoilerFreeMode] = React.useState<boolean>(
    cookie2boolean(cookies[SpoilerFreeModeCookieName], DefaultSpoilerFreeMode)
  );

  const [visibleLayers, setVisibleLayers] = React.useState<MapLayer[]>(
    cookie2VisibleLayers(cookies[VisibleLayersCookieName], DefaultVisibleLayers)
  );

  const [resetAt, setResetAt] = React.useState<number>();

  const isSidebarOpen = (() => {
    if (sidebarState === SidebarState.DEFAULT) {
      // XXX: check viewport size, and decide? defaulting to open for now...
      return true;
    }

    return sidebarState === SidebarState.OPEN;
  })();

  const toggleSidebar = React.useCallback(() => {
    setSidebarState(isSidebarOpen ? SidebarState.CLOSED : SidebarState.OPEN);
  }, [isSidebarOpen]);

  const toggleLayer = React.useCallback(
    (mapLayer: MapLayer) => {
      if (visibleLayers.includes(mapLayer)) {
        setVisibleLayers(visibleLayers.filter((c) => c !== mapLayer));
      } else {
        setVisibleLayers([...visibleLayers, mapLayer]);
      }
    },
    [visibleLayers]
  );

  const toggleSpoilerFreeMode = React.useCallback(() => {
    setSpoilerFreeMode(!spoilerFreeMode);
  }, [spoilerFreeMode]);

  React.useEffect(() => {
    setCookie(SpoilerFreeModeCookieName, boolean2string(spoilerFreeMode), {
      path: '/',
      sameSite: 'lax',
    });
  }, [spoilerFreeMode, setCookie]);

  React.useEffect(() => {
    setCookie(VisibleLayersCookieName, visibleLayers2string(visibleLayers), {
      path: '/',
      sameSite: 'lax',
    });
  }, [visibleLayers, setCookie]);

  const reset = React.useCallback(() => {
    setVisibleLayers(DefaultVisibleLayers);
    setShowLogCounts(DefaultShowLogCounts);
    setSpoilerFreeMode(DefaultSpoilerFreeMode);
    setResetAt(new Date().getMilliseconds());
  }, []);

  return (
    <Router>
      <div
        className={`${
          className ?? ''
        } flex flex-col md:flex-row w-full min-h-screen h-full md:max-h-screen md:h-auto`}
      >
        <div
          className="flex flex-col md:flex-1 overflow-scroll scrollbar-off"
          style={{
            minHeight: 400,
          }}
        >
          <Content>
            <Routes>
              <Route path="/list" element={<List nodes={universe.nodes} />} />
              <Route path="/grid" element={<Grid nodes={universe.nodes} />} />
              <Route
                path="/"
                element={
                  <MappyBoi
                    nodes={universe.nodes}
                    visibleLayers={visibleLayers}
                    showLogCounts={showLogCounts}
                    spoilerFreeMode={spoilerFreeMode}
                    resetAt={resetAt}
                  />
                }
              />
            </Routes>
          </Content>
        </div>
      </div>
    </Router>
  );
};

export default App;
