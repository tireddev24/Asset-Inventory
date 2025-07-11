import { HStack, Input, Button } from "@chakra-ui/react";
import { useState } from "react";

import CustomSelect from "../reusable/customselect";
import { Bank, Branch, equipmentTypes } from "@/store/data";
import Spin from "../ui/spinner";
import { movementData } from "@/types/types";

import { toaster } from "../ui/toaster";

import { useMovementStore } from "@/store/store";
import { DEFAULT_MOVEMENT_DATA } from "@/types/definitions";
import { nameCheck, serialCheck, tagCheck } from "@/utils/functions";

import { errorMessages } from "@/types/definitions";

const NewMovement = ({ loading, setLoading }: any) => {
  const [movementData, setMovementData] = useState<movementData>(
    DEFAULT_MOVEMENT_DATA
  );

  const [load, setLoad] = useState(false);
  const { addMovement } = useMovementStore();

  const validateForm = (): boolean => {
    const requiredFields: (keyof movementData)[] = [
      "type",
      "tag",
      "bank",
      "serial_no",
      "reason",
      "newCustodian",
      "from_location",
      "to_location",
    ];

    const emptyFields = requiredFields.filter((field) => {
      const value = movementData[field];
      return !value || (typeof value === "string" && value.includes("--"));
    });

    if (emptyFields.length > 0) {
      toaster.create({
        type: "error",
        title: "Required fields are empty",
        description: `Please fill in all fields`,
        duration: 5000,
      });
      return false;
    }

    if (!tagCheck(movementData.tag)) {
      toaster.create({
        type: "error",
        title: "Invalid Tag Number",
        description: errorMessages.tag,
      });
      return false;
    }

    // Validate serial number format
    if (!serialCheck(movementData.serial_no)) {
      toaster.create({
        type: "error",
        title: "Invalid Serial Number",
        description: errorMessages.serialNumber,
      });
      return false;
    }

    // Validate newCustodian name (only letters and spaces)
    if (!nameCheck(movementData.newCustodian)) {
      toaster.create({
        type: "error",
        title: "Invalid Recipient Name",
        description: errorMessages.name,
      });
      return false;
    }

    return true;
  };

  const handleClear = () => {
    setMovementData(DEFAULT_MOVEMENT_DATA);
  };

  const handleSubmitRegister = async (): Promise<void> => {
    setLoad(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const { success, message } = await addMovement(movementData);

      toaster.create({
        type: success ? "success" : "error",
        title: success ? "Success" : "Error",
        description: message,
      });

      if (success) {
        handleClear();
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoad(false);
    }
  };

  return (
    <form className="grid p-5 grid-cols-2 gap-6 w-full">
      <div>
        <b>Type</b>
        <CustomSelect
          defaultValue="TYPE"
          value={movementData.type || "TYPE"}
          onChange={(value) =>
            setMovementData({ ...movementData, type: value })
          }
          options={equipmentTypes}
        />
      </div>
      <div className="gap-2">
        <b>Bank</b>
        <CustomSelect
          defaultValue="BANK"
          value={movementData.bank || "BANK"}
          onChange={(value) =>
            setMovementData({ ...movementData, bank: value })
          }
          options={Bank}
        />
      </div>
      <div>
        <b>Tag</b>
        <Input
          placeholder="Asset Tag"
          value={movementData.tag}
          onChange={(e) =>
            setMovementData({
              ...movementData,
              tag: e.target.value.toUpperCase(),
            })
          }
        />
      </div>
      <div className="gap-2">
        <b>Serial No</b>
        <Input
          placeholder="Serial Number"
          value={movementData.serial_no}
          onChange={(e) =>
            setMovementData({
              ...movementData,
              serial_no: e.target.value.toUpperCase(),
            })
          }
        />
      </div>
      <div>
        <b>Reason for allocation</b>
        <Input
          placeholder="Reason for allocation"
          value={movementData.reason}
          onChange={(e) =>
            setMovementData({
              ...movementData,
              reason: e.target.value.toUpperCase(),
            })
          }
        />
      </div>
      <div>
        <b>New Custodian</b>
        <Input
          placeholder="New Custodian"
          value={movementData.newCustodian}
          onChange={(e) =>
            setMovementData({
              ...movementData,
              newCustodian: e.target.value.toUpperCase(),
            })
          }
        />
      </div>
      <div>
        <b>Old Location</b>
        <Input
          disabled
          _disabled={{ bg: "gray.400", fontWeight: "700" }}
          placeholder="FROM"
          value={movementData.from_location}
        />
      </div>
      <div>
        <b>New Location</b>
        <CustomSelect
          defaultValue="TO"
          value={movementData.to_location || "TO"}
          onChange={(value) =>
            setMovementData({ ...movementData, to_location: value })
          }
          options={Branch}
        />
      </div>
      <div className="col-span-2">
        <HStack>
          <Button
            disabled={load}
            variant={"subtle"}
            minW={"5.6rem"}
            colorPalette={"green"}
            onClick={() => {
              handleSubmitRegister();
            }}
          >
            {loading ? <Spin /> : "Submit"}
          </Button>
          <Button
            colorPalette={"red"}
            variant={"surface"}
            onClick={() => handleClear()}
          >
            Clear
          </Button>
        </HStack>
      </div>
    </form>
  );
};

export default NewMovement;
