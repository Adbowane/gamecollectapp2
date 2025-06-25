import React, { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  motion as Motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";

const PullToRefresh = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const controls = useAnimation();

  const pullProgress = useTransform(y, [0, 80], [0, 1]);
  const rotate = useTransform(pullProgress, [0, 1], [0, 270]);
  const opacity = useTransform(y, [0, 20, 80], [0, 0.5, 1]);

  const handlePull = async (_, { point }) => {
    if (isRefreshing) return;

    y.set(point.y);
    if (point.y > 80) {
      setIsRefreshing(true);
      controls.start({ y: 80 });

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        controls.start({ y: 0 });
      }
    }
  };

  return (
    <Motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 80 }}
      dragElastic={0.3}
      onDrag={handlePull}
      animate={controls}
      style={{ y }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
        }}
      >
        <Motion.div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 60,
            opacity,
          }}
        >
          <Motion.div style={{ rotate }}>
            <CircularProgress size={30} thickness={4} color="primary" />
          </Motion.div>
        </Motion.div>
        {children}
      </Box>
    </Motion.div>
  );
};

export default PullToRefresh;
