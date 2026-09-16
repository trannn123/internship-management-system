package cit.internship.dto;

public class CompanyProfileResponse {

    private Long id;
    private String companyName;
    private String taxCode;
    private String address;
    private String phone;

    public CompanyProfileResponse() {
    }

    public CompanyProfileResponse(
            Long id,
            String companyName,
            String taxCode,
            String address,
            String phone) {

        this.id = id;
        this.companyName = companyName;
        this.taxCode = taxCode;
        this.address = address;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }
}