package com.project.NetworkApp.Service;

package com.project.NetworkApp.Service;

import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.DTO.AssetCreateDTO;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.DTO.AssetResponseDTO;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AssetServiceImplTest {

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private AssetServiceImpl assetService;

    public AssetServiceImplTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateAsset_Success() {
        AssetCreateDTO dto = new AssetCreateDTO(/* fill with test data */);
        Asset asset = new Asset(/* fill with test data */);

        when(assetRepository.save(any(Asset.class))).thenReturn(asset);

        AssetResponseDTO result = assetService.createAsset(dto);

        assertNotNull(result);
        verify(assetRepository).save(any(Asset.class));
    }

    // Add more tests for other methods and edge cases
}
