package com.jobtrack.controller;

import com.jobtrack.dto.request.*;
import com.jobtrack.entity.*;
import com.jobtrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JobTrackIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDb() {
        userRepository.deleteAll();
    }

    private String registerAndGetToken(String name, String email, String password) throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name(name)
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase()))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asString();
    }

    @Test
    void unauthenticatedAccess_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void authRegisterAndLogin_ShouldValidateAndAuthenticate() throws Exception {
        String token = registerAndGetToken("Priya Sharma", "priya@jobtrack.dev", "Secret123!");

        // Duplicate registration should fail with 409
        RegisterRequest duplicate = RegisterRequest.builder()
                .name("Priya")
                .email("priya@jobtrack.dev")
                .password("Secret123!")
                .build();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict());

        // Login with valid credentials should return 200
        LoginRequest login = LoginRequest.builder()
                .email("priya@jobtrack.dev")
                .password("Secret123!")
                .build();
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.name").value("Priya Sharma"));

        // Login with wrong password should return 401
        LoginRequest badLogin = LoginRequest.builder()
                .email("priya@jobtrack.dev")
                .password("WrongPass")
                .build();
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized());

        // Profile fetch using Bearer token
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("priya@jobtrack.dev"));
    }

    @Test
    void fullWorkflow_CrudSearchInterviewsDashboardAndUserIsolation() throws Exception {
        String userAToken = registerAndGetToken("User A", "usera@jobtrack.dev", "Password123");
        String userBToken = registerAndGetToken("User B", "userb@jobtrack.dev", "Password123");

        // 1. User A creates two applications
        JobApplicationRequest app1 = JobApplicationRequest.builder()
                .companyName("Google")
                .jobTitle("Software Engineer III")
                .jobDescription("Backend distributed systems role")
                .location("Bengaluru")
                .jobType(JobType.FULL_TIME)
                .workMode(WorkMode.HYBRID)
                .salary("35 LPA")
                .applicationDate(LocalDate.now().minusDays(2))
                .status(ApplicationStatus.APPLIED)
                .jobUrl("https://careers.google.com/jobs/123")
                .recruiterName("Neha Kapoor")
                .recruiterEmail("neha@google.com")
                .notes("Referred by alumnus")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(app1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.companyName").value("Google"))
                .andExpect(jsonPath("$.statusHistory", hasSize(1)))
                .andReturn();

        long googleAppId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        JobApplicationRequest app2 = JobApplicationRequest.builder()
                .companyName("Stripe")
                .jobTitle("Java Backend Engineer")
                .location("Remote")
                .jobType(JobType.FULL_TIME)
                .workMode(WorkMode.REMOTE)
                .salary("$140,000")
                .applicationDate(LocalDate.now())
                .status(ApplicationStatus.ASSESSMENT)
                .build();

        mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(app2)))
                .andExpect(status().isCreated());

        // 2. Authorization isolation: User B cannot view, update, delete, or attach interview to User A's app
        mockMvc.perform(get("/api/applications/" + googleAppId)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/applications/" + googleAppId)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isNotFound());

        // 3. User A updates status -> records status history
        JobApplicationRequest updateApp1 = JobApplicationRequest.builder()
                .companyName("Google")
                .jobTitle("Software Engineer III")
                .location("Bengaluru")
                .jobType(JobType.FULL_TIME)
                .workMode(WorkMode.HYBRID)
                .salary("35 LPA")
                .applicationDate(LocalDate.now().minusDays(2))
                .status(ApplicationStatus.INTERVIEW)
                .build();

        mockMvc.perform(put("/api/applications/" + googleAppId)
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateApp1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"))
                .andExpect(jsonPath("$.statusHistory", hasSize(2)));

        // 4. Search applications
        mockMvc.perform(get("/api/applications/search")
                        .param("keyword", "Google")
                        .param("status", "INTERVIEW")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].companyName").value("Google"));

        // 5. Schedule, list, and update an interview
        InterviewRequest interviewReq = InterviewRequest.builder()
                .interviewRound("Technical DSA & System Design")
                .interviewDate(LocalDate.now().plusDays(3))
                .interviewTime(LocalTime.of(14, 30))
                .interviewerName("Rahul Verma")
                .interviewNotes("Focus on concurrency and Spring Boot")
                .outcome(InterviewOutcome.SCHEDULED)
                .build();

        MvcResult interviewRes = mockMvc.perform(post("/api/applications/" + googleAppId + "/interviews")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interviewReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.interviewRound").value("Technical DSA & System Design"))
                .andExpect(jsonPath("$.companyName").value("Google"))
                .andReturn();

        long interviewId = objectMapper.readTree(interviewRes.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(get("/api/applications/" + googleAppId + "/interviews")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        interviewReq.setOutcome(InterviewOutcome.PASSED);
        interviewReq.setInterviewNotes("Cleared round with strong feedback");
        mockMvc.perform(put("/api/interviews/" + interviewId)
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outcome").value("PASSED"));

        // 6. Dashboard stats & recent
        mockMvc.perform(get("/api/dashboard/stats")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalApplications").value(2))
                .andExpect(jsonPath("$.interviews").value(1))
                .andExpect(jsonPath("$.assessments").value(1))
                .andExpect(jsonPath("$.statusDistribution", hasSize(5)))
                .andExpect(jsonPath("$.monthlyActivity", hasSize(6)));

        mockMvc.perform(get("/api/dashboard/recent")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recentApplications", hasSize(2)));

        // 7. Update user profile & password
        UpdateProfileRequest profileReq = UpdateProfileRequest.builder()
                .name("User A Updated")
                .email("usera@jobtrack.dev")
                .currentPassword("Password123")
                .newPassword("NewPassword123")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User A Updated"));

        // 8. Delete interview and application
        mockMvc.perform(delete("/api/interviews/" + interviewId)
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/applications/" + googleAppId)
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isNoContent());
    }
}
