import React from "react";
import { Button, ButtonGroup } from "@mui/material";

function CalcButtons({ selectedKey, setSelectedKey, buttonKeys }) {
  return (
    <ButtonGroup size="small">
      {buttonKeys.map((btnKey) => {
        const isSelected = selectedKey === btnKey;
        const style = { opacity: isSelected ? 1 : 0.4 };

        return (
          <Button
            key={btnKey}
            variant={isSelected ? "contained" : "outlined"}
            sx={style}
            onClick={() => setSelectedKey(btnKey)}
          >
            {btnKey.toUpperCase()}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

export default CalcButtons;
