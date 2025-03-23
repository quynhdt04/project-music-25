import { Form } from "react-bootstrap";
import Select from "react-select";
import "./RelationshipSection.scss";

const RelationshipSection = ({
  title,
  options,
  selectedItems,
  onAddItem,
  onRemoveItem,
}) => (
  <Form.Group controlId={title} className="mb-4">
    <Form.Label className="d-block fw-medium mb-3">{title}</Form.Label>
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-start gap-2">
        <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
          <Select
            options={options.filter(
              (opt) => !selectedItems.find((item) => item.value === opt.value)
            )}
            onChange={onAddItem}
            placeholder={`Search ${title.toLowerCase()}...`}
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#dee2e6",
                "&:hover": { borderColor: "#adb5bd" },
                "&:focus-within": {
                  borderColor: "#6f42c1",
                  boxShadow: "0 0 0 0.25rem rgba(111, 66, 193, 0.25)",
                },
              }),
            }}
          />
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {selectedItems.length > 0 ? (
          selectedItems.map((item) => (
            <div key={item.value} className="selected-item">
              <span>{item.label}</span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemoveItem(item.value)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M13 1L1 13M1 1L13 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="text-muted">No {title.toLowerCase()} selected</div>
        )}
      </div>
    </div>
  </Form.Group>
);

export default RelationshipSection;
