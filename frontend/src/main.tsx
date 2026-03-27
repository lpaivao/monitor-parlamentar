import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme appearance="dark" accentColor="green" grayColor="slate" radius="medium" hasBackground={false}>
      <App />
    </Theme>
  </StrictMode>,
)
