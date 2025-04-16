import React from "react";
import "./CategoryItem.scss";
import { Card } from "react-bootstrap";
import TestImage from "../../assets/2024-12-08.png";
import { Link } from "react-router-dom";

const CategoryItem = ({ data, type }) => {
  return (
    <Card
      className="category-item mb-4"
      style={{
        backgroundColor: "inherit",
        cursor: "pointer",
        flex: "0 0 20%",
        padding: "0 0.375rem",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "calc(0.375rem - (1px))",
          zIndex: 1,
        }}
      >
        <Link to={`/${type}/${data.slug}`}>
          <Card.Img
            variant="top"
            src={data.cover || TestImage}
            className="category-item__image"
          />
        </Link>
      </div>
      <Card.Body>
        {/* <Card.Title>{data.title}</Card.Title> */}
        <Card.Text
          style={{ color: "white", fontSize: "14px", marginBottom: "0.25rem" }}
        >
          {data.title}
        </Card.Text>
        <Card.Text style={{ color: "#b3b3b3", fontSize: "12px" }}>
          {type === "song" ? data.artist : data.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CategoryItem;
