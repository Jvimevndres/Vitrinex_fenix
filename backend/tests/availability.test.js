// backend/tests/availability.test.js
import { 
  normalizeTime, 
  timeToMinutes, 
  validateTimeBlock, 
  detectOverlaps,
  generateSlotsFromBlocks 
} from '../src/helpers/availability.helper.js';

describe('Availability Helper Functions', () => {
  describe('normalizeTime', () => {
    it('should normalize single digit hours', () => {
      expect(normalizeTime('9:30')).toBe('09:30');
      expect(normalizeTime('9:00')).toBe('09:00');
    });

    it('should keep already normalized times', () => {
      expect(normalizeTime('14:30')).toBe('14:30');
      expect(normalizeTime('00:00')).toBe('00:00');
    });

    it('should return null for invalid times', () => {
      expect(normalizeTime('25:00')).toBeNull();
      expect(normalizeTime('invalid')).toBeNull();
    });
  });

  describe('timeToMinutes', () => {
    it('should convert time to minutes correctly', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('14:15')).toBe(855);
      expect(timeToMinutes('23:59')).toBe(1439);
    });
  });

  describe('validateTimeBlock', () => {
    it('should validate correct time blocks', () => {
      const errors = validateTimeBlock({
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30
      });
      expect(errors).toEqual([]);
    });

    it('should detect invalid start time', () => {
      const errors = validateTimeBlock({
        startTime: '25:00',
        endTime: '17:00',
        slotDuration: 30
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('startTime');
    });

    it('should detect end time before start time', () => {
      const errors = validateTimeBlock({
        startTime: '17:00',
        endTime: '09:00',
        slotDuration: 30
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('anterior');
    });

    it('should detect invalid slot duration', () => {
      const errors = validateTimeBlock({
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 0
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('slotDuration');
    });
  });

  describe('detectOverlaps', () => {
    it('should detect overlapping blocks', () => {
      const blocks = [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '12:00', endTime: '15:00' }
      ];
      const overlaps = detectOverlaps(blocks);
      expect(overlaps.length).toBeGreaterThan(0);
    });

    it('should not detect overlaps in adjacent blocks', () => {
      const blocks = [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '13:00', endTime: '17:00' }
      ];
      const overlaps = detectOverlaps(blocks);
      expect(overlaps.length).toBe(0);
    });

    it('should not detect overlaps in separate blocks', () => {
      const blocks = [
        { startTime: '09:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '17:00' }
      ];
      const overlaps = detectOverlaps(blocks);
      expect(overlaps.length).toBe(0);
    });
  });

  describe('generateSlotsFromBlocks', () => {
    it('should generate correct slots with 30 min duration', () => {
      const blocks = [
        { startTime: '09:00', endTime: '10:00', slotDuration: 30 }
      ];
      const slots = generateSlotsFromBlocks(blocks);
      expect(slots).toEqual(['09:00', '09:30']);
    });

    it('should generate correct slots with 60 min duration', () => {
      const blocks = [
        { startTime: '09:00', endTime: '12:00', slotDuration: 60 }
      ];
      const slots = generateSlotsFromBlocks(blocks);
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });

    it('should handle multiple blocks', () => {
      const blocks = [
        { startTime: '09:00', endTime: '10:00', slotDuration: 30 },
        { startTime: '14:00', endTime: '15:00', slotDuration: 30 }
      ];
      const slots = generateSlotsFromBlocks(blocks);
      expect(slots).toEqual(['09:00', '09:30', '14:00', '14:30']);
    });

    it('should return empty array for invalid blocks', () => {
      const blocks = [
        { startTime: '17:00', endTime: '09:00', slotDuration: 30 }
      ];
      const slots = generateSlotsFromBlocks(blocks);
      expect(slots).toEqual([]);
    });
  });
});
