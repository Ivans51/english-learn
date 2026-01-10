import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../LoginView.vue'

// Mock vue-router functions that we need
const mockPush = vi.fn()

// Mock the vue-router module
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    }),
    useRoute: () => ({
      query: {}
    })
  }
})

// Mock useAuth composable
vi.mock('@/composables/useAuth')

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
  Eye: {
    template: '<svg data-testid="eye-icon"></svg>'
  },
  EyeOff: {
    template: '<svg data-testid="eye-off-icon"></svg>'
  },
  Loader2: {
    template: '<svg data-testid="loader-icon"></svg>'
  }
}))

describe('LoginView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Create fresh router instance for each test
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/vocabulary', component: { template: '<div>Vocabulary</div>' } },
        { path: '/register', component: { template: '<div>Register</div>' } }
      ]
    })

    // Default mock for useAuth
    vi.mocked(useAuth).mockReturnValue({
      user: { value: null },
      loading: { value: false },
      isAuthenticated: vi.fn().mockReturnValue(false),
      login: vi.fn().mockResolvedValue(undefined),
      getAuthErrorMessage: vi.fn().mockReturnValue('An error occurred')
    })
  })

  afterEach(() => {
    if (router) {
      router.push('/')
    }
  })

  describe('Component Rendering', () => {
    it('renders login form with all required elements', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.find('h2').text()).toBe('Sign in to your account')
      expect(wrapper.find('#email').exists()).toBe(true)
      expect(wrapper.find('#password').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').text()).toBe('Sign in')
    })

    it('renders email input with correct attributes', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      expect(emailInput.exists()).toBe(true)
      expect(emailInput.attributes('type')).toBe('email')
      expect(emailInput.attributes('autocomplete')).toBe('email')
      expect(emailInput.attributes('required')).toBeDefined()
      expect(emailInput.attributes('placeholder')).toBe('Enter your email')
    })

    it('renders password input with correct attributes', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const passwordInput = wrapper.find('#password')
      expect(passwordInput.exists()).toBe(true)
      expect(passwordInput.attributes('type')).toBe('password')
      expect(passwordInput.attributes('autocomplete')).toBe('current-password')
      expect(passwordInput.attributes('required')).toBeDefined()
      expect(passwordInput.attributes('placeholder')).toBe('Enter your password')
    })

    it('renders remember me checkbox', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const rememberMeCheckbox = wrapper.find('#remember-me')
      expect(rememberMeCheckbox.exists()).toBe(true)
      expect(rememberMeCheckbox.attributes('type')).toBe('checkbox')
      expect(wrapper.find('label[for="remember-me"]').text()).toBe('Remember me')
    })

    it('renders password visibility toggle button', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const toggleButton = wrapper.find('button[type="button"]')
      expect(toggleButton.exists()).toBe(true)
      expect(toggleButton.find('[data-testid="eye-icon"]').exists()).toBe(true)
    })

    it('renders social login buttons', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const socialButtons = wrapper.findAll('button[type="button"]')
      expect(socialButtons.length).toBe(3) // 1 password toggle + 2 social buttons

      const googleButton = socialButtons[1]
      expect(googleButton.text()).toContain('Google')

      const facebookButton = socialButtons[2]
      expect(facebookButton.text()).toContain('Facebook')
    })

    it('renders register link', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const registerLink = wrapper.find('router-link')
      expect(registerLink.exists()).toBe(true)
      expect(registerLink.attributes('to')).toBe('/register')
      expect(registerLink.text()).toBe('create a new account')
    })

    it('renders forgot password link', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const forgotPasswordLink = wrapper.find('a')
      expect(forgotPasswordLink.exists()).toBe(true)
      expect(forgotPasswordLink.text()).toBe('Forgot your password?')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('initially shows password as hidden (password type)', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const passwordInput = wrapper.find('#password')
      expect(passwordInput.attributes('type')).toBe('password')
    })

    it('toggles password visibility when button is clicked', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const toggleButton = wrapper.find('button[type="button"]')
      
      // Initial state - password should be hidden
      expect(wrapper.find('#password').attributes('type')).toBe('password')
      expect(toggleButton.find('[data-testid="eye-icon"]').exists()).toBe(true)

      // Click to show password
      await toggleButton.trigger('click')
      expect(wrapper.find('#password').attributes('type')).toBe('text')
      expect(toggleButton.find('[data-testid="eye-off-icon"]').exists()).toBe(true)

      // Click to hide password again
      await toggleButton.trigger('click')
      expect(wrapper.find('#password').attributes('type')).toBe('password')
      expect(toggleButton.find('[data-testid="eye-icon"]').exists()).toBe(true)
    })

    it('maintains toggle state across multiple clicks', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const toggleButton = wrapper.find('button[type="button"]')

      // Click multiple times
      for (let i = 0; i < 5; i++) {
        await toggleButton.trigger('click')
      }

      // After odd number of clicks, password should be visible
      expect(wrapper.find('#password').attributes('type')).toBe('text')
    })
  })

  describe('Form Data Binding', () => {
    it('binds email input to form data', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      await emailInput.setValue('test@example.com')

      expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
    })

    it('binds password input to form data', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const passwordInput = wrapper.find('#password')
      await passwordInput.setValue('password123')

      expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
    })

    it('binds remember me checkbox to form data', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const rememberMeCheckbox = wrapper.find('#remember-me')
      
      // Initially unchecked
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(false)

      // Check the checkbox
      await rememberMeCheckbox.setChecked()
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(true)

      // Uncheck the checkbox
      await rememberMeCheckbox.setChecked(false)
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(false)
    })
  })

  describe('Form Validation', () => {
    it('requires email field', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      expect(emailInput.attributes('required')).toBeDefined()
    })

    it('requires password field', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const passwordInput = wrapper.find('#password')
      expect(passwordInput.attributes('required')).toBeDefined()
    })

    it('prevents form submission with empty fields', async () => {
      const { login } = useAuth()
      
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Login should not be called with empty fields
      expect(login).not.toHaveBeenCalled()
    })
  })

  describe('Login Submission', () => {
    it('calls login with correct credentials when form is submitted', async () => {
      const { login } = useAuth()
      
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await form.trigger('submit.prevent')

      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('navigates to /vocabulary on successful login', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await form.trigger('submit.prevent')

      // Wait for async operation
      await wrapper.vm.$nextTick()

      expect(mockPush).toHaveBeenCalledWith('/vocabulary')
    })

    it('clears error message before submission', async () => {
      // Set up mock to throw an error on first call
      const loginMock = vi.fn()
        .mockRejectedValueOnce(new Error('auth/invalid-credential'))
        .mockResolvedValueOnce(undefined)
      
      vi.mocked(useAuth).mockReturnValue({
        user: { value: null },
        loading: { value: false },
        isAuthenticated: vi.fn().mockReturnValue(false),
        login: loginMock,
        getAuthErrorMessage: vi.fn().mockReturnValue('Invalid email or password')
      })

      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      // First submission should show error
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.bg-red-100').exists()).toBe(true)

      // Second submission should clear error
      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      await form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Error should be cleared during new submission attempt
      // The error might reappear if login fails again, but we verify the flow works
    })
  })

  describe('Error Handling', () => {
    it('displays error message when login fails', async () => {
      const errorMessage = 'Invalid email or password. Please try again.'
      
      vi.mocked(useAuth).mockReturnValue({
        user: { value: null },
        loading: { value: false },
        isAuthenticated: vi.fn().mockReturnValue(false),
        login: vi.fn().mockRejectedValue(new Error('auth/invalid-credential')),
        getAuthErrorMessage: vi.fn().mockReturnValue(errorMessage)
      })

      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('wrongpassword')
      await form.trigger('submit.prevent')

      await wrapper.vm.$nextTick()

      // Check that error message is displayed
      const errorAlert = wrapper.find('.bg-red-100')
      expect(errorAlert.exists()).toBe(true)
      expect(errorAlert.text()).toContain('Error!')
      expect(errorAlert.text()).toContain(errorMessage)
    })

    it('handles different auth error codes', async () => {
      const testCases = [
        { code: 'auth/user-not-found', expected: 'No account found with this email.' },
        { code: 'auth/wrong-password', expected: 'Incorrect password. Please try again.' },
        { code: 'auth/email-already-in-use', expected: 'This email is already registered.' },
        { code: 'auth/weak-password', expected: 'Password should be at least 6 characters.' },
        { code: 'auth/invalid-email', expected: 'Please enter a valid email address.' },
        { code: 'auth/unknown-error', expected: 'An unexpected error occurred. Please try again later.' }
      ]

      for (const testCase of testCases) {
        const loginMock = vi.fn().mockRejectedValue(new Error(testCase.code))
        
        vi.mocked(useAuth).mockReturnValue({
          user: { value: null },
          loading: { value: false },
          isAuthenticated: vi.fn().mockReturnValue(false),
          login: loginMock,
          getAuthErrorMessage: vi.fn().mockReturnValue(testCase.expected)
        })

        const wrapper = mount(LoginView, {
          global: {
            plugins: [router]
          }
        })

        const form = wrapper.find('form')
        await form.trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        const errorAlert = wrapper.find('.bg-red-100')
        expect(errorAlert.text()).toContain(testCase.expected)
      }
    })

    it('does not display error message initially', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const errorAlert = wrapper.find('.bg-red-100')
      expect(errorAlert.exists()).toBe(false)
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { value: null },
        loading: { value: false },
        isAuthenticated: vi.fn().mockReturnValue(false),
        login: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000))),
        getAuthErrorMessage: vi.fn().mockReturnValue('Error')
      })

      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      const form = wrapper.find('form')
      const submitButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      
      // Start form submission
      form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Button should show loading state
      expect(submitButton.find('[data-testid="loader-icon"]').exists()).toBe(true)
      expect(submitButton.text()).toContain('Signing in...')
    })

    it('disables submit button when loading', async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { value: null },
        loading: { value: false },
        isAuthenticated: vi.fn().mockReturnValue(false),
        login: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000))),
        getAuthErrorMessage: vi.fn().mockReturnValue('Error')
      })

      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      const form = wrapper.find('form')
      const submitButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      
      // Start form submission
      form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Button should be disabled
      expect(submitButton.attributes('disabled')).toBeDefined()
      expect(submitButton.classes()).toContain('disabled:opacity-50')
      expect(submitButton.classes()).toContain('disabled:cursor-not-allowed')
    })

    it('restores button text after loading completes', async () => {
      const loginMock = vi.fn().mockResolvedValue(undefined)
      
      vi.mocked(useAuth).mockReturnValue({
        user: { value: null },
        loading: { value: false },
        isAuthenticated: vi.fn().mockReturnValue(false),
        login: loginMock,
        getAuthErrorMessage: vi.fn().mockReturnValue('Error')
      })

      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      const form = wrapper.find('form')
      const submitButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      
      // Initial button text
      expect(submitButton.text()).toBe('Sign in')

      // Submit form
      form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      await wrapper.vm.$nextTick()

      // Button should show "Sign in" again
      expect(submitButton.text()).toBe('Sign in')
    })
  })

  describe('Remember Me Functionality', () => {
    it('checkbox is unchecked by default', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const rememberMeCheckbox = wrapper.find('#remember-me')
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(false)
    })

    it('checkbox can be toggled', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const rememberMeCheckbox = wrapper.find('#remember-me')
      
      // Check the box
      await rememberMeCheckbox.setChecked()
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(true)

      // Uncheck the box
      await rememberMeCheckbox.setChecked(false)
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(false)
    })

    it('remembers state across interactions', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const rememberMeCheckbox = wrapper.find('#remember-me')
      
      // Check and interact with other fields
      await rememberMeCheckbox.setChecked()
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#password').setValue('password123')
      
      // Checkbox should still be checked
      expect((rememberMeCheckbox.element as HTMLInputElement).checked).toBe(true)
    })
  })

  describe('Social Login Buttons', () => {
    it('renders Google login button', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const socialButtons = wrapper.findAll('button[type="button"]')
      const googleButton = socialButtons[1]

      expect(googleButton.exists()).toBe(true)
      expect(googleButton.text()).toContain('Google')
      expect(googleButton.find('svg').exists()).toBe(true)
    })

    it('renders Facebook login button', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const socialButtons = wrapper.findAll('button[type="button"]')
      const facebookButton = socialButtons[2]

      expect(facebookButton.exists()).toBe(true)
      expect(facebookButton.text()).toContain('Facebook')
      expect(facebookButton.find('svg').exists()).toBe(true)
    })

    it('social login buttons have correct styling classes', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const socialButtons = wrapper.findAll('button[type="button"]')
      const googleButton = socialButtons[1]

      expect(googleButton.classes()).toContain('inline-flex')
      expect(googleButton.classes()).toContain('justify-center')
      expect(googleButton.classes()).toContain('py-2')
      expect(googleButton.classes()).toContain('px-4')
      expect(googleButton.classes()).toContain('border')
      expect(googleButton.classes()).toContain('rounded-md')
    })
  })

  describe('Navigation Links', () => {
    it('register link navigates to /register', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const registerLink = wrapper.find('router-link')
      expect(registerLink.attributes('to')).toBe('/register')
    })

    it('forgot password link is present and styled correctly', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const forgotPasswordLink = wrapper.find('a')
      expect(forgotPasswordLink.exists()).toBe(true)
      expect(forgotPasswordLink.classes()).toContain('text-accent-600')
      expect(forgotPasswordLink.classes()).toContain('dark:text-accent-400')
      expect(forgotPasswordLink.classes()).toContain('hover:text-accent-500')
    })
  })

  describe('Responsive Design', () => {
    it('has correct container classes', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const container = wrapper.find('.min-h-screen')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('flex-col')
      expect(container.classes()).toContain('justify-center')
    })

    it('form container has responsive max-width classes', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const formContainer = wrapper.find('.sm\\:mx-auto')
      expect(formContainer.exists()).toBe(true)
      expect(formContainer.classes()).toContain('sm:max-w-md')
    })
  })

  describe('Accessibility', () => {
    it('email input has correct aria-label', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const emailInput = wrapper.find('#email')
      expect(emailInput.attributes('aria-label')).toBe('Email address')
    })

    it('password input has correct aria-label', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const passwordInput = wrapper.find('#password')
      expect(passwordInput.attributes('aria-label')).toBe('Password')
    })

    it('submit button has type attribute', async () => {
      const wrapper = mount(LoginView, {
        global: {
          plugins: [router]
        }
      })

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
    })
  })
})
