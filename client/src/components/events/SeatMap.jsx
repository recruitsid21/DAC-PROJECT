export default function SeatMap({ seats, selectedSeats, onSeatSelect }) {
  // Group seats by row for better visualization
  const groupSeatsByRow = () => {
    const rows = {};
    seats.forEach((seat) => {
      const row = seat.seat_number.match(/^[A-Za-z]+/)?.[0] || "A";
      if (!rows[row]) {
        rows[row] = [];
      }
      rows[row].push(seat);
    });
    return rows;
  };

  const seatRows = groupSeatsByRow();

  return (
    <div className="space-y-6">
      {/* Stage indicator */}
      <div className="text-center py-4 bg-gray-100 rounded-lg">
        <div className="text-lg font-medium text-gray-700">STAGE</div>
      </div>

      {/* Seat rows */}
      {Object.entries(seatRows).map(([row, rowSeats]) => (
        <div key={row} className="flex justify-center items-center space-x-2">
          <div className="w-8 text-center font-medium">{row}</div>
          <div className="flex flex-wrap gap-2">
            {rowSeats.map((seat) => {
              const isSelected = selectedSeats.includes(seat.seat_id);
              const isBooked = seat.is_booked;

              let seatClass =
                "w-10 h-10 rounded flex items-center justify-center text-sm font-medium ";

              if (isBooked) {
                seatClass += "bg-gray-300 text-gray-500 cursor-not-allowed";
              } else if (isSelected) {
                seatClass += "bg-indigo-600 text-white cursor-pointer";
              } else {
                seatClass +=
                  "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer";
              }

              return (
                <div
                  key={seat.seat_id}
                  className={seatClass}
                  onClick={() => !isBooked && onSeatSelect(seat.seat_id)}
                  title={`${seat.seat_number} - ₹${parseFloat(
                    seat.final_price
                  ).toFixed(2)}`}
                >
                  {seat.seat_number.match(/\d+$/)?.[0]}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Seat legend */}
      <div className="flex justify-center space-x-6 mt-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-indigo-600 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Booked</span>
        </div>
      </div>
    </div>
  );
}
