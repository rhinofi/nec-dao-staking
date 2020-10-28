import React from "react";
import Time from "assets/svgs/time.svg";
import { SvgIcon } from "@material-ui/core";

export const TimeIcon = () => {
  return (
    <SvgIcon>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.9915 1.66675C5.3915 1.66675 1.6665 5.40008 1.6665 10.0001C1.6665 14.6001 5.3915 18.3334 9.9915 18.3334C14.5998 18.3334 18.3332 14.6001 18.3332 10.0001C18.3332 5.40008 14.5998 1.66675 9.9915 1.66675ZM9.99984 16.6667C6.3165 16.6667 3.33317 13.6834 3.33317 10.0001C3.33317 6.31675 6.3165 3.33341 9.99984 3.33341C13.6832 3.33341 16.6665 6.31675 16.6665 10.0001C16.6665 13.6834 13.6832 16.6667 9.99984 16.6667ZM10.4165 5.83342H9.1665V10.8334L13.5415 13.4584L14.1665 12.4334L10.4165 10.2084V5.83342Z"
          fill="url(#paint0_linear)"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="16.8748"
            y1="16.8751"
            x2="1.6665"
            y2="1.66675"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF8800" />
            <stop offset="1" stop-color="#E2A907" />
          </linearGradient>
        </defs>
      </svg>
    </SvgIcon>
  );
};
