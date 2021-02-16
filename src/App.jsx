import './App.scss';
import { Col, Container, Row } from 'react-bootstrap';
import Photosphere from './components/Photosphere/Photosphere';
import ConfigPanel from './components/ConfigPanel/ConfigPanel';

function App() {
  return (
    <Container fluid className="d-flex h-100 p-3">
      <Col className="d-flex flex-column">
        <Row>
          <h1>CovidCar</h1>
        </Row>
        <Row className="flex-grow-1">
          <Col xs={8} className="bg-secondary rounded-lg flex-grow-1 d-flex justify-content-center align-items-center">
            <Photosphere />
          </Col>
          <div className="ml-2" />
          <Col className="bg-secondary rounded-lg flex-grow-1 d-flex justify-content-center align-items-center">
            <ConfigPanel />
          </Col>
        </Row>
      </Col>
    </Container >
  );
}

export default App;