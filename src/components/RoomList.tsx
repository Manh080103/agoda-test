// import React from "react";

export const RoomList = ({
  rooms,
  onJoinRoom,
}: {
  rooms: string[];
  onJoinRoom: (room: string) => void;
}) => {
  return (
    <div>
      <h3>RoomList</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room}>
            {room} <button onClick={() => onJoinRoom(room)}>Join Room</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
