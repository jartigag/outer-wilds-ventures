import React, { useEffect } from 'react';
import useDimensions from 'react-cool-dimensions';
import { ReactSVGPanZoom, Value } from 'react-svg-pan-zoom';
import { Connection, MapNode } from '../../data/universe/types';
import BoundingBox from '../../util/bounding-box';
import theme from '../../util/theme';
import DetectiveMap from '.';
import Log from '../Log';
import MapControls from './MapControls';

type Props = {
  nodes: MapNode[];
};

const scaleFactorMax = 1;
const scaleFactorMin = 0.1;

const MappyBoi: React.FC<Props> = ({ nodes }) => {
  const [selected, setSelected] = React.useState<{
    node?: MapNode;
    connection?: Connection;
  }>({});
  const [isReady, setIsReady] = React.useState(false);
  const [logs, setLogs] = React.useState<string[]>([]);

  const normalised = React.useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        location: {
          x: node.location.x,
          y: -node.location.y,
        },
      })),
    [nodes]
  );

  const boundingBox = React.useMemo(() => {
    const b = new BoundingBox(normalised.map((n) => n.location));
    b.setPadding(150);
    return b;
  }, [normalised]);

  const onSelectNode = React.useCallback(
    (node: MapNode) => {
      if (selected.node?.id === node.id) {
        setSelected({});
        setLogs([]);
      } else {
        setSelected({ node });
        setLogs(node.logs);
      }
    },
    [selected.node?.id]
  );

  const onSelectConnection = React.useCallback(
    (connection: Connection) => {
      if (
        selected.connection?.from.id === connection.from.id &&
        selected.connection?.to.id === connection.to.id
      ) {
        setSelected({});
        setLogs([]);
      } else {
        setSelected({ connection });
        setLogs([
          ...connection.from.connections
            .filter((c) => c.sourceId === connection.to.id)
            .map((c) => c.text),

          // also, for reverse special case:
          ...connection.to.connections
            .filter((c) => c.sourceId === connection.from.id)
            .map((c) => c.text),
        ]);
      }
    },
    [selected.connection?.from.id, selected.connection?.to.id]
  );

  const Viewer = React.useRef<ReactSVGPanZoom>(null);

  React.useEffect(() => {
    Viewer.current?.fitToViewer();
  }, []);

  const [value, setValue] = React.useState<Value>();
  const [scaleFactor, setScaleFactor] = React.useState(scaleFactorMax);

  const onChangeValue = (value: Value) => {
    setValue(value);
  };

  const onZoom = (value: any) => {
    setScaleFactor(value.a);
  };

  const _zoomIn = () => Viewer.current?.zoomOnViewerCenter(1.2);
  const _zoomOut = () => Viewer.current?.zoomOnViewerCenter(1 / 1.2);
  const _fitToViewer = () =>
    (Viewer.current?.fitToViewer as any)('center', 'center');

  const { ref, width, height } = useDimensions();

  useEffect(() => {
    if (width === 0 || height === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      setIsReady(true);
      _fitToViewer();
    });
  }, [width, height]);

  const level =
    (scaleFactor - scaleFactorMin) / (scaleFactorMax - scaleFactorMin);

  return (
    <>
      <div className="bg-page-bg relative max-w-full h-full overflow-scroll scrollbar-off">
        <div className="absolute top-6 right-6" style={{ zIndex: 999 }}>
          <MapControls onZoomIn={_zoomIn} onZoomOut={_zoomOut} level={level} />
        </div>
        <div
          ref={ref as any}
          className={`${isReady ? 'visible' : 'invisible'} h-full`}
        >
          {
            <ReactSVGPanZoom
              value={value ?? ({} as Value)}
              onChangeValue={onChangeValue}
              onZoom={onZoom}
              tool="auto"
              background={theme.colors['page-bg']}
              SVGBackground={theme.colors['page-bg']}
              onChangeTool={() => {}}
              miniatureProps={{
                position: 'none',
                background: '',
                width: 0,
                height: 0,
              }}
              toolbarProps={{ position: 'none' }}
              ref={Viewer}
              width={width > 0 ? width : 500}
              height={height > 0 ? height : 500}
              detectAutoPan={false}
              scaleFactorMax={scaleFactorMax}
              scaleFactorMin={scaleFactorMin}
            >
              <svg
                width={boundingBox.size.width}
                height={boundingBox.size.height}
              >
                <DetectiveMap
                  nodes={normalised}
                  boundingBox={boundingBox}
                  onSelectNode={onSelectNode}
                  onSelectConnection={onSelectConnection}
                  selected={selected}
                />
              </svg>
            </ReactSVGPanZoom>
          }
        </div>
      </div>
      {(selected.node || selected.connection) && <Log logs={logs} />}
    </>
  );
};

export default MappyBoi;