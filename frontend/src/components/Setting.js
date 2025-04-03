import React, { Component, useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateSelector = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setendDate] = useState(null);

  return (
    <div className="setting-datepicker">
      <DatePicker 
        className="datepicker-start"
        selected={startDate} 
        onChange={(date) => setStartDate(date)}
        selectsStart
        dateFormat={"yyyy-MM-dd hh:mm:ss"}
        placeholderText="Start Date"
        showTimeSelect
      />

      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M14 16.94v-4H5.08l-.03-2.01H14V6.94l5 5Z"/>
      </svg>
      
      <DatePicker 
        className="datepicker-end"
        selected={endDate} 
        onChange={(date) => setendDate(date)}
        minDate={startDate}
        dateFormat={"yyyy-MM-dd hh:mm:ss"}
        placeholderText="End Date"
        showTimeSelect
      />
    </div>
  )
};

class Setting extends Component {

  render() {

    return (      
      <section id="setting">
        <DateSelector />
      </section>
    )
  }
}

export default Setting;