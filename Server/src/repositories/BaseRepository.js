class BaseRepository {
  constructor(client, table, options = {}) {
    this.client = client;
    this.table = table;
    this.options = options;
  }

  async create(payload) {
    const { data, error } = await this.client.from(this.table).insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async createMany(payloads) {
    const { data, error } = await this.client.from(this.table).insert(payloads).select();
    if (error) throw error;
    return data;
  }

  async update(id, payload) {
    const { data, error } = await this.client.from(this.table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { data, error } = await this.client.from(this.table).delete().eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await this.client.from(this.table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async findOne(filters = {}) {
    let query = this.client.from(this.table).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.limit(1).single();
    if (error) throw error;
    return data;
  }

  async findAll(filters = {}, sort = null, search = null) {
    let query = this.client.from(this.table).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    if (search) {
      query = query.ilike(this.options.searchField || 'name', `%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort;
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async exists(filters = {}) {
    const data = await this.findOne(filters);
    return Boolean(data);
  }

  async count(filters = {}) {
    let query = this.client.from(this.table).select('*', { count: 'exact', head: true });

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  }

  async paginate(filters = {}, { page = 1, pageSize = 20, sort = null, search = null } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.client.from(this.table).select('*', { count: 'exact' }).range(from, to);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    if (search) {
      query = query.ilike(this.options.searchField || 'name', `%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort;
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data,
      count: count ?? 0,
    };
  }
}

export default BaseRepository;
