import classes from "./AnimatedLotus.module.css";

interface AnimatedLotus {
  className?: string;
}

function AnimatedLotus({ className }: AnimatedLotus) {
  // probably have a gradient of primary shades?
  // middle being regular primary and then slowly start to fade to darkPrimary
  // at the far bottom left/right petals?

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="1 25 98 55"
      enableBackground="new 0 0 100 100"
      xmlSpace="preserve"
      className={className}
    >
      <g>
        <g>
          {/* bottomLeft */}
          <path
            d="M23.702,61.297c-1.438-1.412-2.75-2.909-3.936-4.468c-7.164,0.122-13.735,2.287-18.694,5.934    c4.583,6.779,12.729,12.054,22.627,13.766c9.032,1.562,17.678-0.168,24.132-4.164l-2.527-0.3    C37.5,71.138,29.828,67.313,23.702,61.297z"
            className={classes.bottomLeft}
          />

          {/* mainLeft */}
          <path
            d="M45.567,69.839c-4.812-6.156-7.518-14.323-7.518-23.042c0-0.567,0.016-1.131,0.039-1.692    c-7.034-6.54-15.71-9.828-23.594-9.6c-0.089,8.184,3.61,17.155,10.776,24.193C31.261,65.58,38.556,69.007,45.567,69.839z"
            className={classes.mainLeft}
          />

          {/* bottomSmallLeft */}
          <path
            d="M18.225,54.646c-2.085-3.157-3.659-6.525-4.665-9.978c-3.384,0.064-6.626,0.644-9.574,1.714    c1.094,3.428,2.932,6.77,5.412,9.817C12.201,55.346,15.171,54.815,18.225,54.646z"
            className={classes.bottomSmallLeft}
          />

          {/* topSmallLeft */}
          <path
            d="M41.59,31.027c-2.759-2.499-5.81-4.459-8.963-5.705c-1.523,3.451-2.338,7.442-2.422,11.619    c2.878,1.431,5.637,3.248,8.176,5.424C38.887,38.342,39.975,34.509,41.59,31.027z"
            className={classes.topSmallLeft}
          />

          {/* center */}
          <path
            d="M50,22.901c-5.9,5.671-9.709,14.596-9.709,24.642c0,10.045,3.809,18.97,9.709,24.642c5.9-5.672,9.71-14.597,9.71-24.642    C59.71,37.498,55.9,28.573,50,22.901z"
            className={classes.center}
          />

          {/* topSmallRight */}
          <path
            d="M69.97,36.941c-0.084-4.177-0.897-8.168-2.423-11.619c-3.152,1.246-6.202,3.207-8.962,5.705    c1.615,3.482,2.703,7.314,3.209,11.338C64.333,40.189,67.092,38.372,69.97,36.941z"
            className={classes.topSmallRight}
          />

          {/* bottomSmallRight */}
          <path
            d="M91.231,56.2c2.481-3.048,4.32-6.39,5.413-9.817c-2.947-1.071-6.19-1.65-9.575-1.714    c-1.005,3.453-2.579,6.821-4.663,9.978C85.459,54.815,88.429,55.346,91.231,56.2z"
            className={classes.bottomSmallRight}
          />

          {/* mainRight */}
          <path
            d="M61.95,46.796c0,8.719-2.706,16.886-7.519,23.042c7.012-0.832,14.307-4.259,20.296-10.142    c7.167-7.038,10.866-16.009,10.777-24.193c-7.885-0.228-16.559,3.06-23.594,9.6C61.934,45.666,61.95,46.229,61.95,46.796z"
            className={classes.mainRight}
          />

          {/* bottomRight */}
          <path
            d="M80.232,56.829c-1.185,1.559-2.497,3.056-3.935,4.468c-6.126,6.017-13.798,9.841-21.602,10.768l-2.527,0.3    C58.624,76.36,67.27,78.09,76.3,76.528c9.899-1.712,18.044-6.986,22.628-13.766C93.968,59.116,87.398,56.951,80.232,56.829z"
            className={classes.bottomRight}
          />
        </g>
      </g>
    </svg>
  );
}

export default AnimatedLotus;
