package cit.internship.service;

import cit.internship.entity.Company;
import cit.internship.entity.Lecturer;
import cit.internship.entity.Student;
import cit.internship.entity.User;
import cit.internship.repository.CompanyRepository;
import cit.internship.repository.LecturerRepository;
import cit.internship.repository.StudentRepository;
import cit.internship.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import cit.internship.dto.CompanyProfileResponse;
import cit.internship.dto.LecturerProfileResponse;
import cit.internship.dto.StudentProfileResponse;
import cit.internship.dto.StudentProfileRequest;
import cit.internship.dto.LecturerProfileRequest;
import cit.internship.dto.CompanyProfileRequest;

@ApplicationScoped
public class ProfileService {

    @Inject
    UserRepository userRepository;

    @Inject
    StudentRepository studentRepository;

    @Inject
    LecturerRepository lecturerRepository;

    @Inject
    CompanyRepository companyRepository;

    @Transactional
    public User getOrCreateUser(
            String keycloakUserId,
            String fullName,
            String email,
            String role) {

        User user = userRepository.find("keycloakUserId", keycloakUserId).firstResult();

        if (user != null) {
            // Keep the locally cached profile in sync with Keycloak in case the
            // user's name/email was set or changed after their first login.
            boolean changed = false;

            if (fullName != null && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
                changed = true;
            }

            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
                changed = true;
            }

            if (changed) {
                userRepository.persist(user);
            }

            return user;
        }

        user = new User(
                keycloakUserId,
                fullName,
                email
        );

        userRepository.persist(user);

        createProfile(user, role);

        return user;
    }

    @Transactional
    public Student updateStudentProfile(User user, StudentProfileRequest request) {

        Student student = studentRepository.find("user", user).firstResult();

        if (student == null) {
            throw new IllegalArgumentException(
                    "Student profile not found"
            );
        }

        student.setStudentCode(request.getStudentCode());
        student.setMajor(request.getMajor());
        student.setClassName(request.getClassName());
        student.setPhone(request.getPhone());

        return student;
    }

    @Transactional
    public Lecturer updateLecturerProfile(User user, LecturerProfileRequest request) {
        Lecturer lecturer = lecturerRepository.find("user", user).firstResult();

        if (lecturer == null) {
            throw new IllegalArgumentException("Lecturer profile not found");
        }

        lecturer.setLecturerCode(request.getLecturerCode());
        lecturer.setDepartment(request.getDepartment());
        lecturer.setPhone(request.getPhone());

        return lecturer;
    }

    @Transactional
    public Company updateCompanyProfile(User user, CompanyProfileRequest request) {
        Company company = companyRepository.find("user", user).firstResult();

        if (company == null) {
            throw new IllegalArgumentException("Company profile not found");
        }

        company.setCompanyName(request.getCompanyName());
        company.setTaxCode(request.getTaxCode());
        company.setAddress(request.getAddress());
        company.setPhone(request.getPhone());

        return company;
    }

    private void createProfile(User user, String role) {
        switch (role) {
            case "STUDENT":
                Student student = new Student(user);
                studentRepository.persist(student);
                break;

            case "LECTURER":
                Lecturer lecturer = new Lecturer(user);
                lecturerRepository.persist(lecturer);
                break;

            case "COMPANY":
                Company company = new Company(user);
                companyRepository.persist(company);
                break;

            case "ADMIN":
                break;

            default:
                throw new IllegalArgumentException(
                        "Unsupported role: " + role
                );
        }
    }

    public Object getProfile(User user, String role) {
        switch (role) {
            case "STUDENT":
                Student student = studentRepository.find("user", user).firstResult();

                if (student == null) {
                    return null;
                }

                return new StudentProfileResponse(
                        student.getId(),
                        student.getStudentCode(),
                        student.getMajor(),
                        student.getClassName(),
                        student.getPhone()
                );

            case "LECTURER":
                Lecturer lecturer = lecturerRepository.find("user", user).firstResult();

                if (lecturer == null) {
                    return null;
                }

                return new LecturerProfileResponse(
                        lecturer.getId(),
                        lecturer.getLecturerCode(),
                        lecturer.getDepartment(),
                        lecturer.getPhone()
                );

            case "COMPANY":
                Company company = companyRepository.find("user", user).firstResult();

                if (company == null) {
                    return null;
                }

                return new CompanyProfileResponse(
                        company.getId(),
                        company.getCompanyName(),
                        company.getTaxCode(),
                        company.getAddress(),
                        company.getPhone()
                );

            case "ADMIN":
                return null;

            default:
                throw new IllegalArgumentException(
                        "Unsupported role: " + role
                );
        }
    }
}