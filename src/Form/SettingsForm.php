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
    $key = $this->config('smarty.settings')->get('key');
    $form['key'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Website Key'),
      '#default_value' => $key,
    ];

    if ($key) {
      $form['demo'] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Demo'),
      ];
      $form['demo']['address'] = [
        '#type' => 'address',
        '#default_value' => [
          'country_code' => 'US',
        ],
        '#field_overrides' => [
          'postalCode' => 'hidden',
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
      ->save();
    parent::submitForm($form, $form_state);
  }

}
