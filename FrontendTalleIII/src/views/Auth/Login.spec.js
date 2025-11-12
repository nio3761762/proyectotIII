import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Login from './Login.vue';

// Mocking the API module
vi.mock('@/Server/api', () => ({
  login: vi.fn(),
}));

// Mocking the router
const mockRouter = {
  push: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

// Mocking the Autapi module
vi.mock('@/Server/Autapi', () => ({
    startTokenRefreshTimer: vi.fn(),
}));
 

describe('Prueba_Login', () => {
  it('should show an error if the email is empty', async () => {
    const wrapper = shallowMount(Login);
    await wrapper.find('button[type="submit"]').trigger('click');
    expect(wrapper.html()).toContain('El correo electrónico es requerido');
  });

  it('should show an error if the email format is invalid', async () => {
    const wrapper = shallowMount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('invalid-email');
    await wrapper.find('button[type="submit"]').trigger('click');
    expect(wrapper.html()).toContain('El correo debe contener exactamente un símbolo @');
  });

  it('should show an error if the password is empty', async () => {
    const wrapper = shallowMount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('test@gmail.com');
    await wrapper.find('button[type="submit"]').trigger('click');
    expect(wrapper.html()).toContain('La contraseña es requerida');
  });

  it('should show an error if the password is less than 6 characters', async () => {
    const wrapper = shallowMount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('test@gmail.com');
    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue('12345');
    await wrapper.find('button[type="submit"]').trigger('click');
    expect(wrapper.html()).toContain('La contraseña debe tener al menos 6 caracteres');
  });

  it('should show an error if the PIN is empty', async () => {
    const wrapper = shallowMount(Login);
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('test@gmail.com');
    const passwordInput = wrapper.find('input[placeholder="Tu contraseña"]');
    await passwordInput.setValue('Admin123*');
    await wrapper.find('button[type="submit"]').trigger('click');
    expect(wrapper.html()).toContain('El PIN es requerido');
  });

    it('should show an error if the PIN is not 4 digits', async () => {
        const wrapper = shallowMount(Login);
        const emailInput = wrapper.find('input[type="email"]');
        await emailInput.setValue('test@gmail.com');
        const passwordInput = wrapper.find('input[placeholder="Tu contraseña"]');
        await passwordInput.setValue('Admin123*');
        const pinInput = wrapper.find('input[placeholder="4 dígitos"]');
        await pinInput.setValue('123');
        await wrapper.find('button[type="submit"]').trigger('click');
        expect(wrapper.html()).toContain('El PIN debe tener exactamente 4 dígitos');
    });
});