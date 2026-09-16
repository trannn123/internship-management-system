package cit.internship.dto;

import jakarta.validation.constraints.NotBlank;

public class CompanyProfileRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    private String taxCode;

    @NotBlank
    private String address;

    @NotBlank
    private String phone;

    public CompanyProfileRequest() {
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}