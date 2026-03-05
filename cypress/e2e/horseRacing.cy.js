describe('Horse Racing Game', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })

  // ─────────────────────────────────────────
  // Initial State
  // ─────────────────────────────────────────
  describe('Initial page load', () => {
    it('shows the Horse Racing header', () => {
      cy.get('.app-header h1').should('contain', 'Horse Racing')
    })

    it('shows the GENERATE PROGRAM button', () => {
      cy.get('.btn--primary').should('contain', 'GENERATE PROGRAM')
    })

    it('shows the START button disabled initially', () => {
      cy.get('.btn--secondary').should('be.disabled')
    })

    it('shows empty horse list initially', () => {
      cy.get('.horse-list tbody tr').should('not.exist')
    })

    it('shows generate prompt on the race track', () => {
      cy.get('.race-track__empty').should('be.visible')
    })

    it('shows empty state in results panel', () => {
      cy.get('.race-results__empty').should('be.visible')
    })
  })

  // ─────────────────────────────────────────
  // Generate Program
  // ─────────────────────────────────────────
  describe('Clicking GENERATE PROGRAM', () => {
    beforeEach(() => {
      cy.get('.btn--primary').click()
    })

    it('populates the horse list with 20 horses', () => {
      cy.get('.horse-list tbody tr').should('have.length', 20)
    })

    it('each horse row has name, condition and color columns', () => {
      cy.get('.horse-list tbody tr')
        .first()
        .within(() => {
          cy.get('td').should('have.length', 3)
        })
    })

    it('shows color dots for each horse', () => {
      cy.get('.horse-list__color-dot').should('have.length', 20)
    })

    it('shows 10 race lanes on the track', () => {
      cy.get('.race-lane').should('have.length', 10)
    })

    it('each lane has a lane number badge', () => {
      cy.get('.race-lane__number').should('have.length', 10)
      cy.get('.race-lane__number').first().should('contain', '1')
      cy.get('.race-lane__number').last().should('contain', '10')
    })

    it('each lane has a horse at the start position', () => {
      cy.get('.race-lane__horse').should('have.length', 10)
      // All horses should be at or near left: 0% before race starts
      cy.get('.race-lane__horse').each(($horse) => {
        const left = parseFloat($horse[0].style.left)
        expect(left).to.be.lessThan(5)
      })
    })

    it('horses are facing right (flipped horizontally)', () => {
      cy.get('.race-lane__horse-icon')
        .first()
        .should(($el) => {
          const transform = $el.css('transform') || $el[0].style.transform
          // scaleX(-1) means the horse is flipped to face right
          expect(transform).to.include('matrix(-1')
        })
    })

    it('shows 6 rounds in the program panel', () => {
      cy.get('.race-program__round').should('have.length', 6)
    })

    it('shows correct distances for each round', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200]
      cy.get('.race-program__round-header').each((header, index) => {
        cy.wrap(header).should('contain', `${distances[index]}m`)
      })
    })

    it('each round in program has 10 horses', () => {
      cy.get('.race-program__round').each((round) => {
        cy.wrap(round).find('tbody tr').should('have.length', 10)
      })
    })

    it('enables the START button after generating', () => {
      cy.get('.btn--secondary').should('not.be.disabled')
    })

    it('shows START label on the button', () => {
      cy.get('.btn--secondary').should('contain', 'START')
    })

    it('re-generating resets and creates a fresh schedule', () => {
      cy.get('.btn--primary').click()
      cy.get('.horse-list tbody tr').should('have.length', 20)
      cy.get('.race-program__round').should('have.length', 6)
      cy.get('.race-results__empty').should('be.visible')
    })
  })

  // ─────────────────────────────────────────
  // Race Execution
  // ─────────────────────────────────────────
  describe('Running the race', () => {
    beforeEach(() => {
      cy.get('.btn--primary').click()
      cy.get('.btn--secondary').click()
    })

    it('changes the button label to PAUSE when racing', () => {
      cy.get('.btn--secondary').should('contain', 'PAUSE')
    })

    it('shows Round 1 info on the track footer', () => {
      cy.get('.race-track__footer').should('contain', 'Round 1')
      cy.get('.race-track__footer').should('contain', '1200m')
    })

    it('shows FINISH label on the track', () => {
      cy.get('.race-track__finish-label').should('contain', 'FINISH')
    })

    it('finish line is visible on each lane', () => {
      cy.get('.race-lane__finish-line').should('have.length', 10)
    })

    it('horses move from start position after race begins', () => {
      // Wait 2 seconds for animation to progress
      cy.wait(2000)
      cy.get('.race-lane__horse').then(($horses) => {
        let movedCount = 0
        $horses.each((_, horse) => {
          const left = parseFloat(horse.style.left)
          if (left > 5) movedCount++
        })
        // At least half the horses should have moved
        expect(movedCount).to.be.greaterThan(4)
      })
    })

    it('horses have bounce animation class while running', () => {
      cy.get('.race-lane__horse').first().should('have.class', 'race-lane__horse--running')
    })

    it('shows results for round 1 after it finishes', () => {
      cy.wait(6000)
      cy.get('.race-results__round').should('have.length.at.least', 1)
    })

    it('round 1 result has 10 horse entries', () => {
      cy.wait(6000)
      cy.get('.race-results__round').first().find('tbody tr').should('have.length', 10)
    })

    it('shows trophy for 1st place in results', () => {
      cy.wait(6000)
      cy.get('.race-results__round').first().find('tbody tr').first().should('contain', '🏆')
    })

    it('round 1 result positions are sequential 1 through 10', () => {
      cy.wait(6000)
      cy.get('.race-results__round')
        .first()
        .find('tbody tr')
        .each((row, index) => {
          if (index === 0) {
            cy.wrap(row).should('contain', '🏆')
          } else {
            cy.wrap(row)
              .find('td')
              .first()
              .should('contain', index + 1)
          }
        })
    })

    it('active round is highlighted in program panel', () => {
      cy.get('.race-program__round--active').should('exist')
    })

    it('shows round complete badge between rounds', () => {
      cy.wait(5500)
      cy.get('.race-track__complete-badge').should('be.visible')
    })
  })

  // ─────────────────────────────────────────
  // Pause & Resume
  // ─────────────────────────────────────────
  describe('Pause and Resume', () => {
    beforeEach(() => {
      cy.get('.btn--primary').click()
      cy.get('.btn--secondary').click()
    })

    it('changes button to RESUME after pausing', () => {
      cy.get('.btn--secondary').click()
      cy.get('.btn--secondary').should('contain', 'RESUME')
    })

    it('horses stop galloping animation when paused', () => {
      cy.get('.btn--secondary').click() // pause
      cy.get('.race-lane__horse').first().should('not.have.class', 'race-lane__horse--running')
    })

    it('resumes racing after clicking RESUME', () => {
      cy.get('.btn--secondary').click() // pause
      cy.get('.btn--secondary').click() // resume
      cy.get('.btn--secondary').should('contain', 'PAUSE')
    })

    it('horses resume galloping after resuming', () => {
      cy.get('.btn--secondary').click() // pause
      cy.get('.btn--secondary').click() // resume
      cy.get('.race-lane__horse').first().should('have.class', 'race-lane__horse--running')
    })

    it('GENERATE is disabled while racing', () => {
      cy.get('.btn--primary').should('be.disabled')
    })

    it('GENERATE becomes enabled again after pausing', () => {
      cy.get('.btn--secondary').click() // pause
      cy.get('.btn--primary').should('not.be.disabled')
    })
  })

  // ─────────────────────────────────────────
  // Full Race Completion
  // ─────────────────────────────────────────
  describe('Full race completion', () => {
    // This test suite uses a longer timeout since all 6 rounds take ~30s
    it('shows all 6 round results after full race', () => {
      cy.get('.btn--primary').click()
      cy.get('.btn--secondary').click()

      // 6 rounds × 5 seconds + buffer
      cy.wait(32000, { timeout: 35000 })

      cy.get('.race-results__round').should('have.length', 6)
    })

    it('shows FINISHED on button after all rounds complete', () => {
      cy.get('.btn--primary').click()
      cy.get('.btn--secondary').click()

      cy.wait(32000, { timeout: 35000 })

      cy.get('.btn--secondary').should('contain', 'FINISHED')
      cy.get('.btn--secondary').should('be.disabled')
    })
  })
})
