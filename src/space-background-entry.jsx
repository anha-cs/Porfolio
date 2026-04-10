import React from 'react'
import { createRoot } from 'react-dom/client'
import SpaceBackground from './SpaceBackground.jsx'

const root = document.getElementById('space-background-root')
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <SpaceBackground />
    </React.StrictMode>
  )
}
