/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

global.Cypress = {
  env: () => false,
  log: () => null,
  config: () => '/cypress/screenshots',
  Commands: {
    add: jest.fn(),
  },
};

global.cy = {
  wrap: subject => subject,
};

const {
  matchImageSnapshotCommand,
  addMatchImageSnapshotCommand,
  addToNotMatchImageSnapshotCommand,
} = require('../src/command');

const defaultOptions = {
  failureThreshold: 0,
  failureThresholdType: 'pixel',
};

const boundMatchImageSnapshot = matchImageSnapshotCommand(defaultOptions).bind({
  test: 'snap',
});
const subject = { screenshot: jest.fn() };
const commandOptions = {
  failureThreshold: 10,
};

describe('command', () => {
  it('should pass options through', () => {
    global.cy.task = jest.fn().mockResolvedValue({ pass: true });

    boundMatchImageSnapshot(subject, commandOptions);

    expect(cy.task).toHaveBeenCalledWith('Matching image snapshot', {
      screenshotsFolder: '/cypress/screenshots',
      updateSnapshots: false,
      options: {
        failureThreshold: 10,
        failureThresholdType: 'pixel',
      },
    });
  });

  describe('calling command', () => {
    describe('to match image snapshot', () => {
      it('should pass', () => {
        global.cy.task = jest.fn().mockResolvedValue({ pass: true });

        expect(
          boundMatchImageSnapshot(subject, commandOptions)
        ).resolves.not.toThrow();
      });

      it('should fail', () => {
        global.cy.task = jest.fn().mockResolvedValue({
          pass: false,
          added: false,
          updated: false,
          diffRatio: 0.1,
          diffPixelCount: 10,
          diffOutputPath: 'cheese',
        });

        expect(
          boundMatchImageSnapshot(subject, commandOptions)
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });

    describe('to not match image snapshot', () => {
      it('should pass', () => {
        global.cy.task = jest.fn().mockResolvedValue({
          pass: false,
          added: false,
          updated: false,
          diffRatio: 0.1,
          diffPixelCount: 10,
        });

        expect(
          boundMatchImageSnapshot(subject, commandOptions)
        ).resolves.not.toThrow();
      });

      it('should fail', () => {
        global.cy.task = jest.fn().mockResolvedValue({
          pass: true,
          added: false,
          updated: false,
          diffRatio: 0.1,
          diffPixelCount: 10,
          diffOutputPath: 'cheese',
        });

        expect(
          boundMatchImageSnapshot(subject, commandOptions)
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe('adding command to Cypress', () => {
    beforeEach(() => {
      Cypress.Commands.add.mockReset();
    });

    describe('snapshots match', () => {
      it('should add command', () => {
        addMatchImageSnapshotCommand();
        expect(Cypress.Commands.add).toHaveBeenCalledWith(
          'matchImageSnapshot',
          { prevSubject: ['optional', 'element', 'window', 'document'] },
          expect.any(Function)
        );
      });

      it('should add command with custom name', () => {
        addMatchImageSnapshotCommand('sayCheese');
        expect(Cypress.Commands.add).toHaveBeenCalledWith(
          'sayCheese',
          { prevSubject: ['optional', 'element', 'window', 'document'] },
          expect.any(Function)
        );
      });

      it('should add command with options', () => {
        addMatchImageSnapshotCommand({ failureThreshold: 0.1 });
        expect(Cypress.Commands.add).toHaveBeenCalledWith(
          'matchImageSnapshot',
          { prevSubject: ['optional', 'element', 'window', 'document'] },
          expect.any(Function)
        );
      });
    });

    describe('snapshots do not match', () => {
      it('should add command', () => {
        addToNotMatchImageSnapshotCommand();
        expect(Cypress.Commands.add).toHaveBeenCalledWith(
          'toNotMatchImageSnapshot',
          { prevSubject: ['optional', 'element', 'window', 'document'] },
          expect.any(Function)
        );
      });

      it('should add command with custom name', () => {
        addToNotMatchImageSnapshotCommand('doNotSayCheese');
        expect(Cypress.Commands.add).toHaveBeenCalledWith(
          'doNotSayCheese',
          { prevSubject: ['optional', 'element', 'window', 'document'] },
          expect.any(Function)
        );
      });

      it('should add command with options', () => {
        addToNotMatchImageSnapshotCommand({ failureThreshold: 0.1 });
        expect(Cypress.Commands.add).toHaveBeenCalledWith(
          'toNotMatchImageSnapshot',
          { prevSubject: ['optional', 'element', 'window', 'document'] },
          expect.any(Function)
        );
      });
    });
  });
});
