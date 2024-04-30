import React from "react";

type Props = {};

// This feels really jank, but don't immediately want to give up the [payment-success] bracket syntax on the file name, since otherwise going to
// /dashboard would take me to /[payment-success]

function Dashboard({}: Props) {
  return <div>test</div>;
}

export default Dashboard;
