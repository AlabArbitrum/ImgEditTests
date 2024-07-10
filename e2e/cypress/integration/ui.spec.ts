describe('dashboard-ui', () => {
  beforeEach(() => {
    cy.visit('/dashboard-ui')
    cy.get('.ImgEditTests-Dashboard-input:first').as('file-input')
    cy.get('.ImgEditTests-Dashboard-AddFiles').as('drop-target')
  })

  it('should not throw when calling ImgEditTests.close()', () => {
    cy.get('@file-input').selectFile(
      [
        'cypress/fixtures/images/kit.jpg',
        'cypress/fixtures/images/traffic.jpg',
      ],
      { force: true },
    )

    cy.window().then(({ ImgEditTests }) => {
      expect(ImgEditTests.close()).to.not.throw
    })
  })

  it('should render thumbnails', () => {
    cy.get('@file-input').selectFile(
      [
        'cypress/fixtures/images/kit.jpg',
        'cypress/fixtures/images/traffic.jpg',
      ],
      { force: true },
    )
    cy.get('.ImgEditTests-Dashboard-Item-previewImg')
      .should('have.length', 2)
      .each((element) => expect(element).attr('src').to.include('blob:'))
  })

  it('should support drag&drop', () => {
    cy.get('@drop-target').selectFile(
      [
        'cypress/fixtures/images/kit.jpg',
        'cypress/fixtures/images/3',
        'cypress/fixtures/images/3.jpg',
        'cypress/fixtures/images/traffic.jpg',
      ],
      { action: 'drag-drop' },
    )

    cy.get('.ImgEditTests-Dashboard-Item').should('have.length', 4)
    cy.get('.ImgEditTests-Dashboard-Item-previewImg')
      .should('have.length', 3)
      .each((element) => expect(element).attr('src').to.include('blob:'))
    cy.window().then(({ ImgEditTests }) => {
      expect(
        JSON.stringify(ImgEditTests.getFiles().map((file) => file.meta.relativePath)),
      ).to.be.equal('[null,null,null,null]')
    })
  })
})
