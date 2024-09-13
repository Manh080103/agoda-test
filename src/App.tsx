import { useState } from "react";
import "./App.css";
import { VideoRoom } from "./components/VideoRoom";
// import ChannelForm from "./components/ChannelForm";

function App() {
  const [joined, setJoined] = useState(false);
  return (
    <div className="App">
      <h1>WDJ Virtual Call</h1>

      {!joined && <button onClick={() => setJoined(true)}>Join Room</button>}

      {joined && (
        <>
          <button onClick={() => setJoined(false)}>
            To Lobby
          </button>
          <VideoRoom />
        </>
      )}

      {/* <ChannelForm /> */}
    </div>
  );
}

export default App;
