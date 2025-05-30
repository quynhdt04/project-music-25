import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./ButtonWithModal.scss";

const ButtonWithModal = ({
  type,
  buttonLabel,
  buttonIcon,
  buttonClassName = "",
  modalTitle,
  modalContent,
  onSubmit,
  isDisabled = true,
}) => {
  // type: button, button-with-icon, icon
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSaveChanges = () => {
    onSubmit();
    handleClose();
  };

  return (
    <>
      {type === "icon" ? (
        <span onClick={handleShow} className={buttonClassName}>
          {buttonIcon}
        </span>
      ) : (
        <Button
          onClick={handleShow}
          className={buttonClassName}
          disabled={isDisabled}
        >
          {type === "button-with-icon" && buttonIcon}
          {buttonLabel}
        </Button>
      )}
      <Modal show={showModal} onHide={handleClose} className="default-modal">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            style={{ padding: "10px 20px" }}
            onClick={handleClose}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ButtonWithModal;
