import { authenticatedFetch } from "./api-client";

/**
 * Company API operations
 */
export const companyAPI = {
  // Get company details
  async getCompany(companyId) {
    return authenticatedFetch(`/api/company/${companyId}`);
  },

  // Get company's job posts
  async getPosts(companyId) {
    return authenticatedFetch(`/api/company/${companyId}/posts`);
  },

  // Update job post
  async updatePost(postId, data) {
    return authenticatedFetch(`/api/job-posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete job post
  async deletePost(postId) {
    return authenticatedFetch(`/api/job-posts/${postId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Student API operations
 */
export const studentAPI = {
  // Get student profile
  async getProfile() {
    return authenticatedFetch("/api/student/profile");
  },

  // Update student profile
  async updateProfile(data) {
    return authenticatedFetch("/api/student/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Get student's applications
  async getApplications() {
    return authenticatedFetch("/api/student/applications");
  },

  // Submit new application
  async submitApplication(postId, coverNote) {
    return authenticatedFetch("/api/student/applications", {
      method: "POST",
      body: JSON.stringify({ postId, coverNote }),
    });
  },
};
