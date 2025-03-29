import React, { useEffect, useState } from "react";
import "./CategoryBlock.scss";
import { isError } from "lodash";
import { Stack } from "react-bootstrap";
import CategoryItem from "../CategoryItem/CategoryItem";
import { Link } from "react-router-dom";
import { ChevronRight } from "react-bootstrap-icons";

const CategoryBlock = ({ title, data }) => {
  return (
    <section className="topic-section mt-5">
      <h5
        className="d-flex justify-content-between mb-4"
        style={{ padding: "0 0.875rem" }}
      >
        <b>{title}</b>
        <Link
          to="/topics"
          style={{
            fontSize: "16px",
            color: "#FFFFFF80",
            textDecoration: "none",
          }}
          className="d-flex align-items-center"
        >
          Tất cả
          <ChevronRight style={{ marginLeft: "0.375rem" }} />
        </Link>
      </h5>
      <div className="d-flex flex-wrap">
        {data.map((item, index) => (
          <CategoryItem key={item.id} data={item} />
        ))}
      </div>
    </section>
  );
};

export default CategoryBlock;
