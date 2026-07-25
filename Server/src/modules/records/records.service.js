import BaseService from '../../services/BaseService.js';
import RecordsRepository from './records.repository.js';

class RecordsService extends BaseService {
  constructor() {
    super(new RecordsRepository());
    this.resourceName = 'participants';
  }
}

export default RecordsService;
