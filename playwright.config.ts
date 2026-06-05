import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Habilitar grabación de video y capturas de pantalla */
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'Mexico',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://testmexico.sites.fuxion.com/',
      },
    },
    {
      name: 'USA',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://testusa.sites.fuxion.com/',
      },
    },
    {
      name: 'Espana',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://testespana.sites.fuxion.com/',
      },
    },
    {
      name: 'Ecuador',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://testecuador.sites.fuxion.com/',
      },
    },
    {
      name: 'Chile',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://testchile.sites.fuxion.com/',
      },
    },
    {
      name: 'Argentina',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://testargentinaa.sites.fuxion.com/',
      },
    },
  ],
});
