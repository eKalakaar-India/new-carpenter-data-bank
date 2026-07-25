import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export const exportUsersToExcel = (users) => {
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(
    users.map((user, index) => ({
      "Sr No": index + 1,
      Name: user.aadhar_name,
      address: user.address,
      age:user.age,
      Date_of_Birth: user.date_of_birth,
      Date_of_Workshop: user.date_of_workshop,
      district:user.district,
      state:user.state,
      pincode:user.pin,
      identity_card_no:user.identity_card_no,
      Fathers_Name:user.fathers_name,
      Gender:user.gender,
      Certificate:user.has_certificate,
      Insurance:user.insurance_enrolled,
      Marital_Status:user.marital_status,
      mobile_no:user.mobile_no,
      Nominee_name:user.nominee_name,
      Nominee_gender:user.nominee_gender,
      Nominee_DOB:user.nominee_dob,
      Nomineee_Relationship:user.relationship_with_participants,
      religion:user.religion,
      training_location:user.training_location,
      "Created At": new Date(user.created_at).toLocaleDateString("en-GB"),
    }))
  );

  XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

  XLSX.writeFile(
    workbook,
    `Participants_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};