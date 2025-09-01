<template>
  <div class="not-found-container">
    <h1 class="title">404</h1>
    <p class="message">Oops! The page you're looking for doesn't exist.</p>
    <router-link to="/" class="home-link">Go to Home</router-link>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for a simple 404 page
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f8f9fa;
  color: #343a40;
  font-family: 'Arial', sans-serif;
}

.title {
  font-size: 8em;
  font-weight: bold;
  margin-bottom: 0.2em;
  color: #dc3545; /* A common error color */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.message {
  font-size: 1.5em;
  margin-bottom: 1em;
}

.home-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff; /* A common primary color */
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
}

.home-link:hover {
  background-color: #0056b3;
}
</style>
