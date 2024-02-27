<?php

declare(strict_types = 1);

namespace Drupal\smarty\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Smarty settings for this site.
 */
final class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'smarty_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['smarty.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('smarty.settings');
    $key = $config->get('key');
    $form['key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Website Key'),
      '#default_value' => $key,
    ];

    $form['address_apply_all'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Apply to all address fields on the site'),
      '#default_value' => $config->get('address_apply_all'),
    ];

    $form['disable_complete'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable address fields once address is chosen'),
      '#default_value' => $config->get('disable_complete'),
    ];

    if ($key) {
      $form['demo'] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Demo'),
      ];
      $form['demo']['address'] = [
        '#type' => 'address',
        '#field_overrides' => [
          'givenName' => 'hidden',
          'additionalName' => 'hidden',
          'familyName' => 'hidden',
          'organization' => 'hidden',
          'addressLine3' => 'hidden',
        ],
        '#available_countries' => ['US'],
        '#smarty' => TRUE,
      ];
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('smarty.settings')
      ->set('key', $form_state->getValue('key'))
      ->set('address_apply_all', !empty($form_state->getValue('address_apply_all')))
      ->set('disable_complete', !empty($form_state->getValue('disable_complete')))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
