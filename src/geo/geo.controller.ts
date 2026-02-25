import { Controller, Get, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { SearchCountriesQueryDto } from './dto/search-countries.query.dto';
import { SearchMunicipalitiesQueryDto } from './dto/search-municipalities.query.dto';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get()
  async findAll() {
    //return await this.geoService.findAllMunicipalities();
    return 'Already implemented in GeoService, but commented out to avoid unnecessary db calls while testing other endpoints';
  }

  @Get('municipalities')
  async searchMunicipalities(@Query() query: SearchMunicipalitiesQueryDto) {
    return await this.geoService.searchMunicipalitiesByCountry(
      query.country,
      query.q,
      query.limit ? Number(query.limit) : undefined,
    );
  }

  @Get('countries')
  countries(@Query() query: SearchCountriesQueryDto) {
    return this.geoService.searchCountries(
      query.q,
      query.limit ? Number(query.limit) : undefined,
    );
  }
}
