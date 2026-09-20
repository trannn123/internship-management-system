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
import cit.internship.dto.UserRequest;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class UserService {

    @Inject
    StudentRepository studentRepository;

    @Inject
    LecturerRepository lecturerRepository;

    @Inject
    CompanyRepository companyRepository;

    @Inject
    UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.listAll();
    }

    public List<Lecturer> getAllLecturers() {
        return lecturerRepository.listAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id);
    }

    public Lecturer getLecturerById(Long id) {
        return lecturerRepository.findById(id);
    }

    public User getUserByKeycloakUserId(String keycloakUserId) {
        return userRepository.find("keycloakUserId", keycloakUserId).firstResult();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(UserRequest request) {
        if (userRepository.find("email", request.getEmail()).firstResult() != null) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (userRepository.find("keycloakUserId", request.getKeycloakUserId()).firstResult() != null) {
            throw new IllegalArgumentException("Keycloak user ID already exists");
        }

        User user = new User(
                request.getKeycloakUserId(),
                request.getFullName(),
                request.getEmail()
        );

        userRepository.persist(user);

        return user;
    }

    @Transactional
    public User updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id);

        if (user == null) {
            return null;
        }

        User existingEmailUser = userRepository.find("email", request.getEmail()).firstResult();

        if (existingEmailUser != null && !existingEmailUser.getId().equals(id)) {
            throw new IllegalArgumentException("Email already exists");
        }

        User existingKeycloakUser = userRepository.find("keycloakUserId", request.getKeycloakUserId()).firstResult();

        if (existingKeycloakUser != null && !existingKeycloakUser.getId().equals(id)) {
            throw new IllegalArgumentException("Keycloak user ID already exists");
        }

        user.setKeycloakUserId(request.getKeycloakUserId());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        return user;
    }

    @Transactional
    public boolean deleteUser(Long id) {
        User user = userRepository.findById(id);

        if (user == null) {
            return false;
        }

        Student student = studentRepository.find("user", user).firstResult();
        if (student != null) {
            studentRepository.delete(student);
        }

        Lecturer lecturer = lecturerRepository.find("user", user).firstResult();
        if (lecturer != null) {
            lecturerRepository.delete(lecturer);
        }

        Company company = companyRepository.find("user", user).firstResult();
        if (company != null) {
            companyRepository.delete(company);
        }

        userRepository.delete(user);

        return true;
    }
}