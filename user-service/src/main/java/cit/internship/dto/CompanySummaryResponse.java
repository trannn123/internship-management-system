package cit.internship.dto;

/**
 * Lightweight company directory entry. Exposes the Company profile id (not the
 * User id) since that is the id other services store as `companyId`.
 */
public class CompanySummaryResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String companyName;
    private String taxCode;
    private String address;
    private String phone;

    public CompanySummaryResponse() {
    }

    public CompanySummaryResponse(
            Long id,
            Long userId,
            String fullName,
            String email,
            String companyName,
            String taxCode,
            String address,
            String phone) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.companyName = companyName;
        this.taxCode = taxCode;
        this.address = address;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
