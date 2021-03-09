import './App.scss';
import { Col, Container, Row } from 'react-bootstrap';
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';

import PointCloud from './components/PointCloud/PointCloud';
import * as Constants from './constants';

function App() {
  return (
    <>
      <Container fluid className="d-flex h-100 p-3">
        <Col className="d-flex flex-column">
          <Row>
            <h1>CovidCar</h1>
          </Row>
          <Row className="flex-grow-1">
            <PointCloud />
          </Row>
        </Col>
      </Container>
      <Draggable bounds="body">
        <div
          className="m-3"
          style={{ position: 'absolute', top: '0px', right: '0px' }}>
          <ReactPlayer
            url={Constants.VIDEO_URL}
            controls={false}
            playing={true}
            volume={0}
            muted={true}
            width="426.7px"
            height="240px"
            style={{borderRadius: 10, overflow: "hidden"}} />
        </div>
      </Draggable>
    </>
  );
}

export default App;
