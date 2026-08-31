import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export const exportUsersToExcel = (users) => {
  console.log(users);
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(
    users.map((user, index) => ({
      "Sr No": index + 1,
      "Enrollment Date":user.created_at,
      "System ID" : user.id,
      "Salutation":user.gender === "MALE" ? "Mr." : "Mrs.",
      "First Name": user.first_name,
      "Middle Name":user.middle_name,
      "Surname_Last":user.last_name,
      "FullName":user.full_name,
      "Gender":user.gender,
      "DateofBirth":user.date_of_birth,
      "Age":user.age,      
      "Marital Status":user.marital_status,
      "Father's Name"	:user.fathers_name,
      "Mother's Name": user.mothers_name,
      "Guardian's Name": user.guardians_name,
      "Religion":user.religion,
      "Social Category":user.social_category,
      "Disability":user.disability ? "Yes" : "No",
      "State":user.state,
      "District":user.district,
      "City/ Block/ Taluka":user.city_block_taluka,
      "Gram Panchayat":user.gram_panchayat,
      "Village":user.village,
      "Pin Code":user.pin_code,
      "IDType":user.id_type,
      "IDNo":user.id_no,
      "EmailID":user.email_id,
      "CountryCode":user.country_code,
      "MobileNo":user.mobile_no,
      "Education Level":user.education_level,
      "Employed":user.employed ? "Yes" : "No",
      "Employment Status":user.employment_status,
      "Training Date":user?.batch_data?.workshop_date || 'NA',
      "Nominee First Name":user.nominee_first_name,
      "Nominee Middle Name":user.nominee_middle_name,
      "Nominee Surname / Last Name":user.nominee_last_name,
      "Nominee Full Name":user.nominee_full_name,
      "Nominee Gender":user.nominee_gender,
      "Nominee Date of Birth":user.nominee_date_of_birth,
      "Nominee Relationship":user.nominee_relationship,
      "Nominee Mobile No":user.nominee_mobile_no,
      "Remarks":user.remarks,
      "Mobiliser Name":user.mobiliser_data.name,
      "Mobiliser Mobile No.": user.mobiliser_data.phone_no,
      "Candidate ID":user.candidate_id,
      "Certificate ID":"",
      "Certificate Link":user.certificate_link,
      "Insurance: Mswasth Link":user.insurance_links.MSwasth,
      "Insurance: Niva Link":user.insurance_links.niva
    }))
  );

  XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

  XLSX.writeFile(
    workbook,
    `Participants_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};