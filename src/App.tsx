import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MappyBoi from './components/DetectiveMap/MappyBoi';
import Grid from './components/Grid';
import Content from './components/layout/Content';
import Sidebar from './components/layout/Sidebar';
import List from './components/List';
import universe from './data/universe';
import { MapLayer } from './util/map-layer';

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
  MapLayer.OTHER,
];

const DefaultShowLogCounts = true;
const DefaultSpoilerFreeMode = true;

const App: React.FC<Props> = ({ className }) => {
  const [sidebarState, setSidebarState] = React.useState<SidebarState>(
    SidebarState.DEFAULT
  );

  const [showLogCounts, setShowLogCounts] = React.useState(
    DefaultShowLogCounts
  );

  const [spoilerFreeMode, setSpoilerFreeMode] = React.useState(
    DefaultSpoilerFreeMode
  );

  const [visibleLayers, setVisibleLayers] = React.useState<MapLayer[]>(
    DefaultVisibleLayers
  );

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

  const toggleShowLogCounts = React.useCallback(() => {
    setShowLogCounts(!showLogCounts);
  }, [showLogCounts]);

  const toggleSpoilerFreeMode = React.useCallback(() => {
    setSpoilerFreeMode(!spoilerFreeMode);
  }, [spoilerFreeMode]);

  const reset = React.useCallback(() => {
    setVisibleLayers(DefaultVisibleLayers);
    setShowLogCounts(DefaultShowLogCounts);
    setSpoilerFreeMode(DefaultSpoilerFreeMode);
  }, []);

  return (
    <Router>
      <div
        className={`${className} md:flex flex-col md:flex-row md:h-screen w-full`}
      >
        <div
          className={`flex ${
            isSidebarOpen ? `md:w-80` : `md:w-20`
          } flex-col w-full flex-shrink-0`}
        >
          <Sidebar
            toggleSidebar={toggleSidebar}
            toggleLayer={toggleLayer}
            visibleLayers={visibleLayers}
            toggleShowLogCounts={toggleShowLogCounts}
            showLogCounts={showLogCounts}
            toggleSpoilerFreeMode={toggleSpoilerFreeMode}
            spoilerFreeMode={spoilerFreeMode}
            reset={reset}
            isOpen={isSidebarOpen}
          />
        </div>

        <div className="flex flex-col flex-1 overflow-scroll scrollbar-off">
          <Content>
            <Switch>
              <Route path="/list">
                <List nodes={universe.nodes} />
              </Route>
              <Route path="/grid">
                <Grid nodes={universe.nodes} />
              </Route>
              <Route path="/">
                <MappyBoi
                  nodes={universe.nodes}
                  visibleLayers={visibleLayers}
                  showLogCounts={showLogCounts}
                  spoilerFreeMode={spoilerFreeMode}
                />
              </Route>
            </Switch>
          </Content>
        </div>
      </div>
    </Router>
  );
};

export default App;
